import { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Space, message, Tag, Tabs, Upload, DatePicker, Timeline } from 'antd';
import { PlusOutlined, UploadOutlined, CommentOutlined, EyeOutlined } from '@ant-design/icons';
import { getComplaints, createComplaint, updateComplaintStatus, addComplaintFollowUp } from '../../apis/complaints';
import dayjs from 'dayjs';

const { TextArea } = Input;

const ComplaintsPage = () => {
    const [loading, setLoading] = useState(false);
    const [complaints, setComplaints] = useState([]);
    const [filteredComplaints, setFilteredComplaints] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<string>('all');
    const [form] = Form.useForm();
    const [followUpForm] = Form.useForm();

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const buildingId = userInfo.buildingId;

    useEffect(() => {
        if (buildingId) {
            fetchComplaints();
        }
    }, [buildingId]);

    useEffect(() => {
        filterComplaints();
    }, [activeTab, complaints]);

    const fetchComplaints = async () => {
        try {
            setLoading(true);
            const response = await getComplaints(buildingId);
            setComplaints(response.data);
        } catch (error: any) {
            message.error(error.message || 'Failed to fetch complaints');
        } finally {
            setLoading(false);
        }
    };

    const filterComplaints = () => {
        if (activeTab === 'all') {
            setFilteredComplaints(complaints);
        } else {
            setFilteredComplaints(complaints.filter((c: any) => c.complaintStatus === activeTab));
        }
    };

    const handleAdd = () => {
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const data = {
                ...values,
                buildingId,
                images: [] // Mock images
            };

            await createComplaint(data);
            message.success('Complaint created successfully');
            setIsModalOpen(false);
            fetchComplaints();
        } catch (error: any) {
            message.error(error.message || 'Failed to create complaint');
        }
    };

    const handleStatusChange = async (complaintId: string, newStatus: string) => {
        try {
            await updateComplaintStatus(complaintId, newStatus);
            message.success('Complaint status updated successfully');
            fetchComplaints();
        } catch (error: any) {
            message.error(error.message || 'Failed to update status');
        }
    };

    const handleAddFollowUp = (complaint: any) => {
        setSelectedComplaint(complaint);
        followUpForm.resetFields();
        setIsFollowUpModalOpen(true);
    };

    const handleFollowUpSubmit = async () => {
        try {
            const values = await followUpForm.validateFields();
            const data = {
                ...values,
                nextFollowUpDate: values.nextFollowUpDate ? values.nextFollowUpDate.format('YYYY-MM-DD') : null
            };

            await addComplaintFollowUp(selectedComplaint._id, data);
            message.success('Follow-up added successfully');
            setIsFollowUpModalOpen(false);
            fetchComplaints();
        } catch (error: any) {
            message.error(error.message || 'Failed to add follow-up');
        }
    };

    const handleViewDetails = (complaint: any) => {
        setSelectedComplaint(complaint);
        setIsViewModalOpen(true);
    };

    const getStatusColor = (status: string) => {
        const colors: any = {
            'open': 'red',
            'in-process': 'blue',
            'on-hold': 'orange',
            'close': 'green',
            're-open': 'purple',
            'dismiss': 'gray'
        };
        return colors[status] || 'default';
    };

    const columns = [
        {
            title: 'Complaint No',
            dataIndex: 'complaintNumber',
            key: 'complaintNumber',
        },
        {
            title: 'Title',
            dataIndex: 'complaintTitle',
            key: 'complaintTitle',
        },
        {
            title: 'Type',
            dataIndex: 'complaintType',
            key: 'complaintType',
            render: (type: string) => (
                <Tag color={type === 'common' ? 'blue' : 'green'}>
                    {type?.toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Unit',
            dataIndex: ['unitId', 'unitNumber'],
            key: 'unitNumber',
            render: (unit: string) => unit || '-'
        },
        {
            title: 'Status',
            dataIndex: 'complaintStatus',
            key: 'complaintStatus',
            render: (status: string) => (
                <Tag color={getStatusColor(status)}>
                    {status?.replace('-', ' ').toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Priority',
            dataIndex: 'priority',
            key: 'priority',
            render: (priority: string) => {
                const colors: any = { 'low': 'green', 'medium': 'orange', 'high': 'red' };
                return <Tag color={colors[priority]}>{priority?.toUpperCase()}</Tag>;
            }
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => new Date(date).toLocaleDateString()
        },
        {
            title: 'Actions',
            key: 'actions',
            fixed: 'right',
            width: 250,
            render: (_: any, record: any) => (
                <Space>
                    <Button
                        type="link"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewDetails(record)}
                    >
                        View
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        icon={<CommentOutlined />}
                        onClick={() => handleAddFollowUp(record)}
                    >
                        Follow-up
                    </Button>
                    {record.complaintStatus !== 'close' && record.complaintStatus !== 'dismiss' && (
                        <Select
                            size="small"
                            value={record.complaintStatus}
                            style={{ width: 120 }}
                            onChange={(value) => handleStatusChange(record._id, value)}
                        >
                            <Select.Option value="open">Open</Select.Option>
                            <Select.Option value="in-process">In Process</Select.Option>
                            <Select.Option value="on-hold">On Hold</Select.Option>
                            <Select.Option value="close">Close</Select.Option>
                            <Select.Option value="re-open">Re-open</Select.Option>
                            <Select.Option value="dismiss">Dismiss</Select.Option>
                        </Select>
                    )}
                </Space>
            )
        }
    ];

    const tabItems = [
        { key: 'all', label: `All (${complaints.length})` },
        { key: 'open', label: `Open (${complaints.filter((c: any) => c.complaintStatus === 'open').length})` },
        { key: 'in-process', label: `In Process (${complaints.filter((c: any) => c.complaintStatus === 'in-process').length})` },
        { key: 'on-hold', label: `On Hold (${complaints.filter((c: any) => c.complaintStatus === 'on-hold').length})` },
        { key: 'close', label: `Closed (${complaints.filter((c: any) => c.complaintStatus === 'close').length})` },
        { key: 're-open', label: `Re-opened (${complaints.filter((c: any) => c.complaintStatus === 're-open').length})` },
        { key: 'dismiss', label: `Dismissed (${complaints.filter((c: any) => c.complaintStatus === 'dismiss').length})` }
    ];

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Complaints</h1>
                    <p className="text-gray-500">Manage and track resident complaints</p>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                >
                    Add Complaint
                </Button>
            </div>

            <Card>
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={tabItems}
                />
                <Table
                    loading={loading}
                    dataSource={filteredComplaints}
                    columns={columns}
                    rowKey="_id"
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 1400 }}
                />
            </Card>

            {/* Create Complaint Modal */}
            <Modal
                title="Add Complaint"
                open={isModalOpen}
                onOk={handleSubmit}
                onCancel={() => setIsModalOpen(false)}
                okText="Save"
                width={700}
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Form.Item
                        name="complaintTitle"
                        label="Complaint Title"
                        rules={[{ required: true, message: 'Please enter complaint title' }]}
                    >
                        <Input placeholder="Enter complaint title" />
                    </Form.Item>
                    <Form.Item
                        name="complaintDescription"
                        label="Description"
                        rules={[{ required: true, message: 'Please enter description' }]}
                    >
                        <TextArea
                            rows={4}
                            placeholder="Enter detailed description"
                        />
                    </Form.Item>
                    <Form.Item
                        name="complaintType"
                        label="Complaint Type"
                        rules={[{ required: true, message: 'Please select type' }]}
                    >
                        <Select placeholder="Select complaint type">
                            <Select.Option value="common">Common Area</Select.Option>
                            <Select.Option value="unit">Unit Specific</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="priority"
                        label="Priority"
                        initialValue="medium"
                    >
                        <Select placeholder="Select priority">
                            <Select.Option value="low">Low</Select.Option>
                            <Select.Option value="medium">Medium</Select.Option>
                            <Select.Option value="high">High</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label="Images (Mock)"
                        tooltip="Image upload is mocked - not implemented yet"
                    >
                        <Upload
                            listType="picture-card"
                            beforeUpload={() => {
                                message.info('Image upload is mocked - not implemented yet');
                                return false;
                            }}
                        >
                            <div>
                                <UploadOutlined />
                                <div style={{ marginTop: 8 }}>Upload</div>
                            </div>
                        </Upload>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Follow-up Modal */}
            <Modal
                title="Add Follow-up"
                open={isFollowUpModalOpen}
                onOk={handleFollowUpSubmit}
                onCancel={() => setIsFollowUpModalOpen(false)}
                okText="Save"
            >
                <Form form={followUpForm} layout="vertical" className="mt-4">
                    <Form.Item
                        name="remarks"
                        label="Remarks"
                        rules={[{ required: true, message: 'Please enter remarks' }]}
                    >
                        <TextArea
                            rows={4}
                            placeholder="Enter follow-up remarks"
                        />
                    </Form.Item>
                    <Form.Item
                        name="nextFollowUpDate"
                        label="Next Follow-up Date"
                    >
                        <DatePicker
                            style={{ width: '100%' }}
                            disabledDate={(current) => current && current < dayjs().startOf('day')}
                        />
                    </Form.Item>
                    <Form.Item
                        name="sendEmailNotification"
                        label="Send Email Notification"
                        initialValue={false}
                    >
                        <Select>
                            <Select.Option value={true}>Yes</Select.Option>
                            <Select.Option value={false}>No</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>

            {/* View Details Modal */}
            <Modal
                title="Complaint Details"
                open={isViewModalOpen}
                onCancel={() => setIsViewModalOpen(false)}
                footer={[
                    <Button key="close" onClick={() => setIsViewModalOpen(false)}>
                        Close
                    </Button>
                ]}
                width={700}
            >
                {selectedComplaint && (
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold">Complaint Number:</h3>
                            <p>{selectedComplaint.complaintNumber}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold">Title:</h3>
                            <p>{selectedComplaint.complaintTitle}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold">Description:</h3>
                            <p>{selectedComplaint.complaintDescription}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold">Status:</h3>
                            <Tag color={getStatusColor(selectedComplaint.complaintStatus)}>
                                {selectedComplaint.complaintStatus?.replace('-', ' ').toUpperCase()}
                            </Tag>
                        </div>
                        {selectedComplaint.followUps && selectedComplaint.followUps.length > 0 && (
                            <div>
                                <h3 className="font-semibold mb-2">Follow-ups:</h3>
                                <Timeline>
                                    {selectedComplaint.followUps.map((followUp: any, index: number) => (
                                        <Timeline.Item key={index}>
                                            <p className="font-medium">{followUp.remarks}</p>
                                            <p className="text-gray-500 text-sm">
                                                {new Date(followUp.updatedAt).toLocaleString()}
                                            </p>
                                            {followUp.nextFollowUpDate && (
                                                <p className="text-sm">
                                                    Next Follow-up: {new Date(followUp.nextFollowUpDate).toLocaleDateString()}
                                                </p>
                                            )}
                                        </Timeline.Item>
                                    ))}
                                </Timeline>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ComplaintsPage;
