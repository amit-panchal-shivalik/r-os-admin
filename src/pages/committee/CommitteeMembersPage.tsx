import { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Space, message, Popconfirm, Tag, DatePicker, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import { getCommitteeMembers, createCommitteeMember, updateCommitteeMember, deleteCommitteeMember } from '../../apis/committeeMembers';
import dayjs from 'dayjs';

const CommitteeMembersPage = () => {
    const [loading, setLoading] = useState(false);
    const [members, setMembers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<any>(null);
    const [form] = Form.useForm();

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const buildingId = userInfo.buildingId;

    useEffect(() => {
        if (buildingId) {
            fetchMembers();
        }
    }, [buildingId]);

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const response = await getCommitteeMembers(buildingId);
            setMembers(response.data);
        } catch (error: any) {
            message.error(error.message || 'Failed to fetch committee members');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingMember(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (record: any) => {
        setEditingMember(record);
        form.setFieldsValue({
            firstName: record.firstName,
            lastName: record.lastName,
            countryCode: record.countryCode,
            phoneNumber: record.phoneNumber,
            email: record.email,
            committeeType: record.committeeType,
            startDate: record.startDate ? dayjs(record.startDate) : null,
            endDate: record.endDate ? dayjs(record.endDate) : null,
            status: record.status
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteCommitteeMember(id);
            message.success('Committee member deleted successfully');
            fetchMembers();
        } catch (error: any) {
            message.error(error.message || 'Failed to delete committee member');
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const data = {
                ...values,
                buildingId,
                startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : null,
                endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : null
            };

            if (editingMember) {
                await updateCommitteeMember(editingMember._id, data);
                message.success('Committee member updated successfully');
            } else {
                await createCommitteeMember(data);
                message.success('Committee member created successfully');
            }

            setIsModalOpen(false);
            fetchMembers();
        } catch (error: any) {
            message.error(error.message || 'Failed to save committee member');
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'Chairman':
                return 'red';
            case 'Secretary':
                return 'blue';
            case 'Treasurer':
                return 'green';
            case 'Member':
                return 'default';
            default:
                return 'default';
        }
    };

    const columns = [
        {
            title: 'Name',
            key: 'name',
            render: (_: any, record: any) => `${record.firstName} ${record.lastName}`
        },
        {
            title: 'Role',
            dataIndex: 'committeeType',
            key: 'committeeType',
            render: (role: string) => (
                <Tag color={getRoleColor(role)}>
                    {role?.toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Contact',
            key: 'contact',
            render: (_: any, record: any) => (
                <div>
                    <div><PhoneOutlined /> {record.countryCode} {record.phoneNumber}</div>
                    <div><MailOutlined /> {record.email}</div>
                </div>
            )
        },
        {
            title: 'Term Start',
            dataIndex: 'startDate',
            key: 'startDate',
            render: (date: string) => date ? new Date(date).toLocaleDateString() : '-'
        },
        {
            title: 'Term End',
            dataIndex: 'endDate',
            key: 'endDate',
            render: (date: string) => date ? new Date(date).toLocaleDateString() : '-'
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={status === 'active' ? 'green' : 'red'}>
                    {status?.toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: any) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Are you sure to delete this committee member?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="link" danger icon={<DeleteOutlined />}>
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Committee Members</h1>
                    <p className="text-gray-500">Manage society committee members and their roles</p>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                >
                    Add Member
                </Button>
            </div>

            <Card>
                <Table
                    loading={loading}
                    dataSource={members}
                    columns={columns}
                    rowKey="_id"
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Modal
                title={editingMember ? 'Edit Committee Member' : 'Add Committee Member'}
                open={isModalOpen}
                onOk={handleSubmit}
                onCancel={() => setIsModalOpen(false)}
                okText="Save"
                width={700}
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="firstName"
                                label="First Name"
                                rules={[{ required: true, message: 'Please enter first name' }]}
                            >
                                <Input placeholder="Enter first name" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="lastName"
                                label="Last Name"
                                rules={[{ required: true, message: 'Please enter last name' }]}
                            >
                                <Input placeholder="Enter last name" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="countryCode"
                                label="Country Code"
                                initialValue="+91"
                            >
                                <Input placeholder="+91" />
                            </Form.Item>
                        </Col>
                        <Col span={16}>
                            <Form.Item
                                name="phoneNumber"
                                label="Phone Number"
                                rules={[{ required: true, message: 'Please enter phone number' }]}
                            >
                                <Input placeholder="Enter phone number" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Please enter email' },
                            { type: 'email', message: 'Please enter valid email' }
                        ]}
                    >
                        <Input placeholder="Enter email address" />
                    </Form.Item>
                    <Form.Item
                        name="committeeType"
                        label="Committee Role"
                        rules={[{ required: true, message: 'Please select role' }]}
                    >
                        <Select placeholder="Select committee role">
                            <Select.Option value="Chairman">Chairman</Select.Option>
                            <Select.Option value="Secretary">Secretary</Select.Option>
                            <Select.Option value="Treasurer">Treasurer</Select.Option>
                            <Select.Option value="Member">Member</Select.Option>
                        </Select>
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="startDate"
                                label="Term Start Date"
                                rules={[{ required: true, message: 'Please select start date' }]}
                            >
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="endDate"
                                label="Term End Date"
                            >
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item
                        name="status"
                        label="Status"
                        initialValue="active"
                    >
                        <Select placeholder="Select status">
                            <Select.Option value="active">Active</Select.Option>
                            <Select.Option value="inactive">Inactive</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default CommitteeMembersPage;
