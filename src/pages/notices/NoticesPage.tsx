import { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Space, message, Popconfirm, Tag, Switch, Upload, Row, Col, Statistic, Tabs } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FileOutlined, UploadOutlined, BellOutlined, CheckCircleOutlined, ClockCircleOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { getNotices, createNotice, updateNotice, deleteNotice, publishNotice } from '../../apis/notices';
import { getBlocks } from '../../apis/buildingSettings';

const { TextArea } = Input;

const NoticesPage = () => {
    const [loading, setLoading] = useState(false);
    const [notices, setNotices] = useState([]);
    const [filteredNotices, setFilteredNotices] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNotice, setEditingNotice] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<string>('all');
    const [searchText, setSearchText] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('');
    const [priorityFilter, setPriorityFilter] = useState<string>('');
    const [form] = Form.useForm();

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const buildingId = userInfo.buildingId;

    useEffect(() => {
        if (buildingId) {
            fetchBlocks();
            fetchNotices();
        }
    }, [buildingId]);

    useEffect(() => {
        filterNotices();
    }, [activeTab, notices, searchText, categoryFilter, priorityFilter]);

    const fetchBlocks = async () => {
        try {
            const response = await getBlocks(buildingId);
            setBlocks(response.data);
        } catch (error: any) {
            message.error('Failed to fetch blocks');
        }
    };

    const fetchNotices = async () => {
        try {
            setLoading(true);
            const response = await getNotices(buildingId);
            setNotices(response.data);
        } catch (error: any) {
            message.error(error.message || 'Failed to fetch notices');
        } finally {
            setLoading(false);
        }
    };

    const filterNotices = () => {
        let filtered = notices;

        // Filter by tab (status)
        if (activeTab !== 'all') {
            filtered = filtered.filter((notice: any) => notice.noticeStatus === activeTab);
        }

        // Filter by search text
        if (searchText) {
            filtered = filtered.filter((notice: any) =>
                notice.title?.toLowerCase().includes(searchText.toLowerCase()) ||
                notice.description?.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        // Filter by category
        if (categoryFilter) {
            filtered = filtered.filter((notice: any) => notice.category === categoryFilter);
        }

        // Filter by priority
        if (priorityFilter) {
            filtered = filtered.filter((notice: any) => notice.priority === priorityFilter);
        }

        setFilteredNotices(filtered);
    };

    const getStatistics = () => {
        const total = notices.length;
        const published = notices.filter((n: any) => n.noticeStatus === 'published').length;
        const draft = notices.filter((n: any) => n.noticeStatus === 'draft').length;
        const highPriority = notices.filter((n: any) => n.priority === 'high').length;
        
        return { total, published, draft, highPriority };
    };

    const stats = getStatistics();

    const handleAdd = () => {
        setEditingNotice(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (record: any) => {
        setEditingNotice(record);
        form.setFieldsValue({
            title: record.title,
            message: record.description, // Backend uses 'description'
            category: record.category,
            priority: record.priority,
            targetUserType: record.targetUserType,
            blockIds: record.blockIds?.map((block: any) => block._id),
            publishNow: record.noticeStatus === 'published'
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteNotice(id);
            message.success('Notice deleted successfully');
            fetchNotices();
        } catch (error: any) {
            message.error(error.message || 'Failed to delete notice');
        }
    };

    const handlePublish = async (id: string, currentStatus: string) => {
        try {
            await publishNotice(id);
            message.success('Notice published successfully');
            fetchNotices();
        } catch (error: any) {
            message.error(error.message || 'Failed to update notice status');
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            
            const data = {
                title: values.title,
                description: values.message, // Map 'message' to 'description'
                category: values.category,
                priority: values.priority,
                buildingId,
                blockIds: values.blockIds || [],
                targetUserType: values.targetUserType || 'all',
                publishNow: values.publishNow || false,
                publishDate: values.publishNow ? new Date() : (values.publishDate || new Date()),
                expiryDate: values.expiryDate || null,
                attachments: [] // File upload optional
            };

            if (editingNotice) {
                await updateNotice(editingNotice._id, data);
                message.success('Notice updated successfully');
            } else {
                await createNotice(data);
                message.success('Notice created successfully');
            }

            setIsModalOpen(false);
            fetchNotices();
        } catch (error: any) {
            message.error(error.message || 'Failed to save notice');
        }
    };

    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            width: 200,
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
            width: 300,
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            render: (category: string) => (
                <Tag color="purple">
                    {category?.toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Priority',
            dataIndex: 'priority',
            key: 'priority',
            render: (priority: string) => {
                const color = priority === 'high' ? 'red' : priority === 'medium' ? 'orange' : 'green';
                return <Tag color={color}>{priority?.toUpperCase()}</Tag>;
            }
        },
        {
            title: 'Target Audience',
            dataIndex: 'targetUserType',
            key: 'targetUserType',
            render: (type: string) => (
                <Tag color="blue">
                    {type === 'all' ? 'All Residents' : type === 'owner' ? 'Owners Only' : 'Tenants Only'}
                </Tag>
            )
        },
        {
            title: 'Blocks',
            dataIndex: 'blockIds',
            key: 'blockIds',
            render: (blockIds: any[]) => {
                if (!blockIds || blockIds.length === 0) return <Tag>All Blocks</Tag>;
                return (
                    <Space wrap>
                        {blockIds.map((block: any) => (
                            <Tag key={block._id}>{block.blockName}</Tag>
                        ))}
                    </Space>
                );
            }
        },
        {
            title: 'Status',
            dataIndex: 'noticeStatus',
            key: 'noticeStatus',
            render: (status: string) => (
                <Tag color={status === 'published' ? 'green' : 'orange'}>
                    {status?.toUpperCase()}
                </Tag>
            )
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
            fixed: 'right' as const,
            width: 250,
            render: (_: any, record: any) => (
                <Space>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => handlePublish(record._id, record.noticeStatus)}
                    >
                        {record.noticeStatus === 'published' ? 'Unpublish' : 'Publish'}
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Are you sure to delete this notice?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="link" size="small" danger icon={<DeleteOutlined />}>
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
                    <h1 className="text-2xl font-bold text-gray-800">Notice Board</h1>
                    <p className="text-gray-500">Manage and publish notices for residents</p>
                </div>
            </div>

            {/* Statistics Cards */}
            <Row gutter={16} className="mb-6">
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Total Notices"
                            value={stats.total}
                            prefix={<BellOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Published"
                            value={stats.published}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Drafts"
                            value={stats.draft}
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="High Priority"
                            value={stats.highPriority}
                            prefix={<BellOutlined />}
                            valueStyle={{ color: '#ff4d4f' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card>
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={[
                        {
                            key: 'all',
                            label: `All Notices (${notices.length})`,
                        },
                        {
                            key: 'published',
                            label: `Published (${stats.published})`,
                        },
                        {
                            key: 'draft',
                            label: `Drafts (${stats.draft})`,
                        },
                    ]}
                />

                {/* Search and Filter Bar */}
                <div className="mt-4 mb-4 p-4 bg-gray-50 rounded">
                    <Row gutter={[16, 16]} align="middle">
                        <Col xs={24} sm={24} md={10}>
                            <Input
                                placeholder="Search by title or description..."
                                prefix={<SearchOutlined />}
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                allowClear
                                size="large"
                            />
                        </Col>
                        <Col xs={12} sm={12} md={5}>
                            <Select
                                placeholder="Filter by Category"
                                value={categoryFilter || undefined}
                                onChange={(value) => setCategoryFilter(value || '')}
                                allowClear
                                size="large"
                                style={{ width: '100%' }}
                            >
                                <Select.Option value="general">General</Select.Option>
                                <Select.Option value="maintenance">Maintenance</Select.Option>
                                <Select.Option value="event">Event</Select.Option>
                                <Select.Option value="emergency">Emergency</Select.Option>
                                <Select.Option value="meeting">Meeting</Select.Option>
                                <Select.Option value="sos">SOS</Select.Option>
                            </Select>
                        </Col>
                        <Col xs={12} sm={12} md={5}>
                            <Select
                                placeholder="Filter by Priority"
                                value={priorityFilter || undefined}
                                onChange={(value) => setPriorityFilter(value || '')}
                                allowClear
                                size="large"
                                style={{ width: '100%' }}
                            >
                                <Select.Option value="high">High</Select.Option>
                                <Select.Option value="medium">Medium</Select.Option>
                                <Select.Option value="low">Low</Select.Option>
                            </Select>
                        </Col>
                        <Col xs={24} sm={24} md={4}>
                            <Button
                                type="primary"
                                icon={<BellOutlined />}
                                onClick={handleAdd}
                                size="large"
                                block
                            >
                                Create Notice
                            </Button>
                        </Col>
                    </Row>
                    {(searchText || categoryFilter || priorityFilter) && (
                        <div className="mt-3 text-gray-600">
                            Showing {filteredNotices.length} of {notices.length} notices
                        </div>
                    )}
                </div>

                <Table
                    loading={loading}
                    dataSource={filteredNotices}
                    columns={columns}
                    rowKey="_id"
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 1200 }}
                    className="mt-4"
                />
            </Card>

            <Modal
                title={editingNotice ? 'Edit Notice' : 'Add Notice'}
                open={isModalOpen}
                onOk={handleSubmit}
                onCancel={() => setIsModalOpen(false)}
                okText="Save"
                width={700}
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Form.Item
                        name="title"
                        label="Notice Title"
                        rules={[
                            { required: true, message: 'Please enter notice title' },
                            { min: 5, message: 'Title must be at least 5 characters' },
                            { max: 200, message: 'Title cannot exceed 200 characters' }
                        ]}
                    >
                        <Input 
                            placeholder="Enter notice title" 
                            showCount 
                            maxLength={200}
                        />
                    </Form.Item>
                    <Form.Item
                        name="message"
                        label="Notice Message"
                        rules={[
                            { required: true, message: 'Please enter notice message' },
                            { min: 10, message: 'Message must be at least 10 characters' },
                            { max: 5000, message: 'Message cannot exceed 5000 characters' }
                        ]}
                    >
                        <TextArea
                            rows={5}
                            placeholder="Enter detailed notice message"
                            showCount
                            maxLength={5000}
                        />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="category"
                                label="Category"
                                rules={[{ required: true, message: 'Please select category' }]}
                            >
                                <Select placeholder="Select category">
                                    <Select.Option value="general">General</Select.Option>
                                    <Select.Option value="maintenance">Maintenance</Select.Option>
                                    <Select.Option value="event">Event</Select.Option>
                                    <Select.Option value="emergency">Emergency</Select.Option>
                                    <Select.Option value="meeting">Meeting</Select.Option>
                                    <Select.Option value="sos">SOS</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="priority"
                                label="Priority"
                                rules={[{ required: true, message: 'Please select priority' }]}
                            >
                                <Select placeholder="Select priority">
                                    <Select.Option value="low">Low</Select.Option>
                                    <Select.Option value="medium">Medium</Select.Option>
                                    <Select.Option value="high">High</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item
                        name="targetUserType"
                        label="Target Audience"
                        rules={[{ required: true, message: 'Please select target audience' }]}
                        initialValue="all"
                    >
                        <Select placeholder="Select target audience">
                            <Select.Option value="all">All Residents</Select.Option>
                            <Select.Option value="owner">Owners Only</Select.Option>
                            <Select.Option value="tenant">Tenants Only</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="blockIds"
                        label="Target Blocks (Optional)"
                        tooltip="Leave empty to target all blocks"
                    >
                        <Select
                            mode="multiple"
                            placeholder="Select blocks (leave empty for all blocks)"
                            allowClear
                        >
                            {blocks.map((block: any) => (
                                <Select.Option key={block._id} value={block._id}>
                                    {block.blockName}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label="Attachments"
                        tooltip="File upload feature coming soon"
                    >
                        <Upload
                            beforeUpload={() => {
                                message.info('File upload feature will be implemented soon');
                                return false;
                            }}
                        >
                            <Button icon={<UploadOutlined />}>Click to Upload</Button>
                        </Upload>
                    </Form.Item>
                    <Form.Item
                        name="publishNow"
                        label="Publish Immediately"
                        valuePropName="checked"
                        initialValue={false}
                    >
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default NoticesPage;
