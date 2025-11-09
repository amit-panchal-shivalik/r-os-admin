import { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Space, message, Tag, Tabs, Upload, DatePicker, Timeline, Divider } from 'antd';
import { PlusOutlined, UploadOutlined, CommentOutlined, EyeOutlined, SendOutlined } from '@ant-design/icons';
import { getComplaints, createComplaint, updateComplaintStatus, addComplaintFollowUp, addComplaintReply, getComplaintById } from '../../apis/complaints';
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
    const [replyText, setReplyText] = useState('');
    const [sendingReply, setSendingReply] = useState(false);
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
                images: [] // Image upload to be implemented
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

    const handleViewDetails = async (complaint: any) => {
        try {
            // Fetch fresh complaint details with replies
            const response = await getComplaintById(complaint._id);
            setSelectedComplaint(response.data);
            setReplyText('');
            setIsViewModalOpen(true);
        } catch (error: any) {
            message.error('Failed to load complaint details');
        }
    };

    const handleSendReply = async () => {
        if (!replyText.trim()) {
            message.error('Please enter a message');
            return;
        }

        setSendingReply(true);
        try {
            await addComplaintReply(selectedComplaint._id, {
                message: replyText.trim(),
                isAdminReply: true,
            });
            message.success('Reply sent successfully');
            setReplyText('');
            // Refresh complaint details
            const response = await getComplaintById(selectedComplaint._id);
            setSelectedComplaint(response.data);
            fetchComplaints();
        } catch (error: any) {
            message.error('Failed to send reply');
        } finally {
            setSendingReply(false);
        }
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
                        label="Images"
                        tooltip="Image upload feature coming soon"
                    >
                        <Upload
                            listType="picture-card"
                            beforeUpload={() => {
                                message.info('Image upload feature will be implemented soon');
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

            {/* View Details Modal with Thread */}
            <Modal
                title="Complaint Details"
                open={isViewModalOpen}
                onCancel={() => setIsViewModalOpen(false)}
                footer={null}
                width={800}
            >
                {selectedComplaint && (
                    <div>
                        {/* Header Info */}
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                            <div>
                                <Space>
                                    <Tag color={getStatusColor(selectedComplaint.complaintStatus)}>
                                        {selectedComplaint.complaintStatus?.replace('-', ' ').toUpperCase()}
                                    </Tag>
                                    <Tag color={selectedComplaint.priority === 'high' ? 'red' : selectedComplaint.priority === 'medium' ? 'orange' : 'green'}>
                                        {selectedComplaint.priority?.toUpperCase()}
                                    </Tag>
                                </Space>
                            </div>
                            <div>
                                <h3 style={{ marginBottom: 8, fontSize: '16px', fontWeight: 600 }}>{selectedComplaint.title}</h3>
                                <p style={{ color: '#666', marginBottom: 4 }}>📋 {selectedComplaint.category}</p>
                                <p style={{ fontSize: '12px', color: '#999' }}>
                                    Submitted on {new Date(selectedComplaint.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div>
                                <strong>Description:</strong>
                                <p style={{ marginTop: 8, color: '#555' }}>{selectedComplaint.description}</p>
                            </div>

                            <Divider style={{ margin: '12px 0' }} />

                            {/* Thread/Replies */}
                            <div>
                                <h4 style={{ marginBottom: 12, fontWeight: 600 }}>
                                    Conversation ({selectedComplaint.replies?.length || 0})
                                </h4>
                                <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: 16 }}>
                                    {selectedComplaint.replies && selectedComplaint.replies.length > 0 ? (
                                        selectedComplaint.replies.map((reply: any, index: number) => (
                                            <div
                                                key={index}
                                                style={{
                                                    marginBottom: 12,
                                                    padding: 12,
                                                    backgroundColor: reply.isAdminReply ? '#e6f7ff' : '#f5f5f5',
                                                    borderRadius: 8,
                                                    borderLeft: reply.isAdminReply ? '3px solid #1890ff' : '3px solid #d9d9d9',
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                                    <strong style={{ color: reply.isAdminReply ? '#1890ff' : '#595959' }}>
                                                        {reply.isAdminReply ? '👨‍💼 Admin' : '👤 ' + (reply.createdBy?.firstName || 'User')}
                                                    </strong>
                                                    <span style={{ fontSize: '12px', color: '#999' }}>
                                                        {new Date(reply.createdAt).toLocaleString()}
                                                    </span>
                                                </div>
                                                <p style={{ margin: 0, color: '#333' }}>{reply.message}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p style={{ textAlign: 'center', color: '#999', padding: 20 }}>No replies yet</p>
                                    )}
                                </div>

                                {/* Reply Input */}
                                {selectedComplaint.complaintStatus !== 'close' && selectedComplaint.complaintStatus !== 'dismiss' && (
                                    <div>
                                        <TextArea
                                            rows={3}
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder="Type your reply..."
                                            maxLength={500}
                                            style={{ marginBottom: 8 }}
                                        />
                                        <Button
                                            type="primary"
                                            icon={<SendOutlined />}
                                            onClick={handleSendReply}
                                            loading={sendingReply}
                                            disabled={!replyText.trim()}
                                        >
                                            Send Reply
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </Space>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ComplaintsPage;
