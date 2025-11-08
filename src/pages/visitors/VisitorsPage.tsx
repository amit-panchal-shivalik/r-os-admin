import { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Space, message, Tag, Row, Col, Statistic, Tabs, DatePicker } from 'antd';
import { PlusOutlined, UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { getVisitors, getTodayVisitors, getVisitorStats, createVisitor, updateVisitor } from '../../apis/visitors';
import dayjs from 'dayjs';

const VisitorsPage = () => {
    const [loading, setLoading] = useState(false);
    const [visitors, setVisitors] = useState([]);
    const [todayVisitors, setTodayVisitors] = useState([]);
    const [stats, setStats] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVisitor, setEditingVisitor] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<string>('today');
    const [form] = Form.useForm();

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const buildingId = userInfo.buildingId;

    useEffect(() => {
        if (buildingId) {
            fetchStats();
            fetchTodayVisitors();
            fetchAllVisitors();
        }
    }, [buildingId]);

    const fetchStats = async () => {
        try {
            const response = await getVisitorStats(buildingId);
            setStats(response.data);
        } catch (error: any) {
            message.error('Failed to fetch visitor stats');
        }
    };

    const fetchTodayVisitors = async () => {
        try {
            setLoading(true);
            const response = await getTodayVisitors(buildingId);
            setTodayVisitors(response.data);
        } catch (error: any) {
            message.error(error.message || 'Failed to fetch today\'s visitors');
        } finally {
            setLoading(false);
        }
    };

    const fetchAllVisitors = async () => {
        try {
            setLoading(true);
            const response = await getVisitors(buildingId);
            setVisitors(response.data);
        } catch (error: any) {
            message.error(error.message || 'Failed to fetch visitors');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingVisitor(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (record: any) => {
        setEditingVisitor(record);
        form.setFieldsValue({
            visitorName: record.visitorName,
            visitorPhoneNumber: record.visitorPhoneNumber,
            purpose: record.purpose,
            visitorType: record.visitorType,
            vehicleNumber: record.vehicleNumber,
            expectedCheckoutTime: record.expectedCheckoutTime ? dayjs(record.expectedCheckoutTime, 'HH:mm') : null
        });
        setIsModalOpen(true);
    };

    const handleCheckout = async (visitorId: string) => {
        try {
            await updateVisitor(visitorId, {
                checkoutTime: dayjs().format('HH:mm'),
                visitorStatus: 'checked_out'
            });
            message.success('Visitor checked out successfully');
            fetchTodayVisitors();
            fetchAllVisitors();
            fetchStats();
        } catch (error: any) {
            message.error(error.message || 'Failed to checkout visitor');
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const data = {
                ...values,
                buildingId,
                checkinTime: dayjs().format('HH:mm'),
                expectedCheckoutTime: values.expectedCheckoutTime ? values.expectedCheckoutTime.format('HH:mm') : null,
                visitDate: dayjs().format('YYYY-MM-DD')
            };

            if (editingVisitor) {
                await updateVisitor(editingVisitor._id, data);
                message.success('Visitor updated successfully');
            } else {
                await createVisitor(data);
                message.success('Visitor checked in successfully');
            }

            setIsModalOpen(false);
            fetchTodayVisitors();
            fetchAllVisitors();
            fetchStats();
        } catch (error: any) {
            message.error(error.message || 'Failed to save visitor');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'checked_in':
                return 'green';
            case 'checked_out':
                return 'blue';
            case 'expected':
                return 'orange';
            default:
                return 'default';
        }
    };

    const getVisitorTypeColor = (type: string) => {
        const colors: any = {
            'guest': 'blue',
            'delivery': 'green',
            'service': 'orange',
            'cab': 'purple'
        };
        return colors[type] || 'default';
    };

    const columns = [
        {
            title: 'Visitor Name',
            dataIndex: 'visitorName',
            key: 'visitorName',
        },
        {
            title: 'Phone',
            dataIndex: 'visitorPhoneNumber',
            key: 'visitorPhoneNumber',
        },
        {
            title: 'Unit',
            dataIndex: ['unitId', 'unitNumber'],
            key: 'unitNumber',
            render: (unit: string) => unit || '-'
        },
        {
            title: 'Purpose',
            dataIndex: 'purpose',
            key: 'purpose',
        },
        {
            title: 'Type',
            dataIndex: 'visitorType',
            key: 'visitorType',
            render: (type: string) => (
                <Tag color={getVisitorTypeColor(type)}>
                    {type?.toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Check-in',
            dataIndex: 'checkinTime',
            key: 'checkinTime',
        },
        {
            title: 'Check-out',
            dataIndex: 'checkoutTime',
            key: 'checkoutTime',
            render: (time: string) => time || '-'
        },
        {
            title: 'Status',
            dataIndex: 'visitorStatus',
            key: 'visitorStatus',
            render: (status: string) => (
                <Tag color={getStatusColor(status)}>
                    {status?.replace('_', ' ').toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: any) => (
                <Space>
                    {record.visitorStatus === 'checked_in' && (
                        <Button
                            type="primary"
                            size="small"
                            onClick={() => handleCheckout(record._id)}
                        >
                            Check Out
                        </Button>
                    )}
                    <Button
                        type="link"
                        size="small"
                        onClick={() => handleEdit(record)}
                    >
                        Edit
                    </Button>
                </Space>
            )
        }
    ];

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Visitors Management</h1>
                <p className="text-gray-500">Track and manage building visitors</p>
            </div>

            {stats && (
                <Row gutter={[16, 16]} className="mb-6">
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Today's Visitors"
                                value={stats.todayCount}
                                prefix={<UserOutlined />}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card className="bg-green-50 border-green-200">
                            <Statistic
                                title="Currently Inside"
                                value={stats.currentlyInside}
                                prefix={<ClockCircleOutlined />}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="This Week"
                                value={stats.weekCount}
                                valueStyle={{ color: '#722ed1' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="This Month"
                                value={stats.monthCount}
                                valueStyle={{ color: '#fa8c16' }}
                            />
                        </Card>
                    </Col>
                </Row>
            )}

            <Card>
                <div className="flex justify-between items-center mb-4">
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        items={[
                            { key: 'today', label: `Today's Visitors (${todayVisitors.length})` },
                            { key: 'all', label: 'All Visitors' }
                        ]}
                    />
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAdd}
                    >
                        Check In Visitor
                    </Button>
                </div>
                <Table
                    loading={loading}
                    dataSource={activeTab === 'today' ? todayVisitors : visitors}
                    columns={columns}
                    rowKey="_id"
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 1200 }}
                />
            </Card>

            <Modal
                title={editingVisitor ? 'Edit Visitor' : 'Check In Visitor'}
                open={isModalOpen}
                onOk={handleSubmit}
                onCancel={() => setIsModalOpen(false)}
                okText="Save"
                width={600}
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Form.Item
                        name="visitorName"
                        label="Visitor Name"
                        rules={[{ required: true, message: 'Please enter visitor name' }]}
                    >
                        <Input placeholder="Enter visitor name" />
                    </Form.Item>
                    <Form.Item
                        name="visitorPhoneNumber"
                        label="Phone Number"
                        rules={[{ required: true, message: 'Please enter phone number' }]}
                    >
                        <Input placeholder="Enter phone number" />
                    </Form.Item>
                    <Form.Item
                        name="purpose"
                        label="Purpose of Visit"
                        rules={[{ required: true, message: 'Please enter purpose' }]}
                    >
                        <Input placeholder="Enter purpose of visit" />
                    </Form.Item>
                    <Form.Item
                        name="visitorType"
                        label="Visitor Type"
                        rules={[{ required: true, message: 'Please select visitor type' }]}
                    >
                        <Select placeholder="Select visitor type">
                            <Select.Option value="guest">Guest</Select.Option>
                            <Select.Option value="delivery">Delivery</Select.Option>
                            <Select.Option value="service">Service</Select.Option>
                            <Select.Option value="cab">Cab/Transport</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="vehicleNumber"
                        label="Vehicle Number (Optional)"
                    >
                        <Input placeholder="Enter vehicle number" />
                    </Form.Item>
                    <Form.Item
                        name="expectedCheckoutTime"
                        label="Expected Checkout Time"
                    >
                        <DatePicker.TimePicker
                            style={{ width: '100%' }}
                            format="HH:mm"
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default VisitorsPage;
