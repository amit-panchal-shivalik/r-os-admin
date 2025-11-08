import { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Space, message, Popconfirm, Tag, Switch, Upload } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FileOutlined, UploadOutlined } from '@ant-design/icons';
import { getNotices, createNotice, updateNotice, deleteNotice, publishNotice } from '../../apis/notices';
import { getBlocks } from '../../apis/buildingSettings';

const { TextArea } = Input;

const NoticesPage = () => {
    const [loading, setLoading] = useState(false);
    const [notices, setNotices] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNotice, setEditingNotice] = useState<any>(null);
    const [form] = Form.useForm();

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const buildingId = userInfo.buildingId;

    useEffect(() => {
        if (buildingId) {
            fetchBlocks();
            fetchNotices();
        }
    }, [buildingId]);

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

    const handleAdd = () => {
        setEditingNotice(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (record: any) => {
        setEditingNotice(record);
        form.setFieldsValue({
            title: record.title,
            message: record.message,
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
            const newStatus = currentStatus === 'published' ? 'draft' : 'published';
            await publishNotice(id, newStatus);
            message.success(`Notice ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`);
            fetchNotices();
        } catch (error: any) {
            message.error(error.message || 'Failed to update notice status');
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const data = {
                ...values,
                buildingId,
                noticeStatus: values.publishNow ? 'published' : 'draft',
                attachments: [] // Mock attachments
            };

            delete data.publishNow;

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
            title: 'Message',
            dataIndex: 'message',
            key: 'message',
            ellipsis: true,
            width: 300,
        },
        {
            title: 'Target Audience',
            dataIndex: 'targetUserType',
            key: 'targetUserType',
            render: (types: string[]) => (
                <Space wrap>
                    {types?.map((type: string) => (
                        <Tag key={type} color="blue">
                            {type.toUpperCase()}
                        </Tag>
                    ))}
                </Space>
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
            fixed: 'right',
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
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                >
                    Add Notice
                </Button>
            </div>

            <Card>
                <Table
                    loading={loading}
                    dataSource={notices}
                    columns={columns}
                    rowKey="_id"
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 1200 }}
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
                        rules={[{ required: true, message: 'Please enter notice title' }]}
                    >
                        <Input placeholder="Enter notice title" />
                    </Form.Item>
                    <Form.Item
                        name="message"
                        label="Notice Message"
                        rules={[{ required: true, message: 'Please enter notice message' }]}
                    >
                        <TextArea
                            rows={5}
                            placeholder="Enter detailed notice message"
                        />
                    </Form.Item>
                    <Form.Item
                        name="targetUserType"
                        label="Target Audience"
                        rules={[{ required: true, message: 'Please select target audience' }]}
                    >
                        <Select
                            mode="multiple"
                            placeholder="Select target audience"
                        >
                            <Select.Option value="owner">Owners</Select.Option>
                            <Select.Option value="tenant">Tenants</Select.Option>
                            <Select.Option value="employee">Employees</Select.Option>
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
                        label="Attachments (Mock)"
                        tooltip="File upload is mocked - no actual upload will happen"
                    >
                        <Upload
                            beforeUpload={() => {
                                message.info('File upload is mocked - not implemented yet');
                                return false;
                            }}
                        >
                            <Button icon={<UploadOutlined />}>Click to Upload (Mock)</Button>
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
