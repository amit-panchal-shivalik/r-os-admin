import { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Space, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getBlocks, createBlock, updateBlock, deleteBlock } from '../../apis/buildingSettings';

const BlocksPage = () => {
    const [loading, setLoading] = useState(false);
    const [blocks, setBlocks] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBlock, setEditingBlock] = useState<any>(null);
    const [form] = Form.useForm();

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const buildingId = userInfo.buildingId;

    useEffect(() => {
        if (buildingId) {
            fetchBlocks();
        }
    }, [buildingId]);

    const fetchBlocks = async () => {
        try {
            setLoading(true);
            const response = await getBlocks(buildingId);
            setBlocks(response.data);
        } catch (error: any) {
            message.error(error.message || 'Failed to fetch blocks');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingBlock(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (record: any) => {
        setEditingBlock(record);
        form.setFieldsValue({
            blockName: record.blockName
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteBlock(id);
            message.success('Block deleted successfully');
            fetchBlocks();
        } catch (error: any) {
            message.error(error.message || 'Failed to delete block');
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const data = {
                ...values,
                buildingId
            };

            if (editingBlock) {
                await updateBlock(editingBlock._id, data);
                message.success('Block updated successfully');
            } else {
                await createBlock(data);
                message.success('Block created successfully');
            }

            setIsModalOpen(false);
            fetchBlocks();
        } catch (error: any) {
            message.error(error.message || 'Failed to save block');
        }
    };

    const columns = [
        {
            title: 'Block Name',
            dataIndex: 'blockName',
            key: 'blockName',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <span className={status === 'active' ? 'text-green-600' : 'text-red-600'}>
                    {status?.toUpperCase()}
                </span>
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
                        title="Are you sure to delete this block?"
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
                    <h1 className="text-2xl font-bold text-gray-800">Blocks</h1>
                    <p className="text-gray-500">Manage building blocks</p>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                >
                    Add Block
                </Button>
            </div>

            <Card>
                <Table
                    loading={loading}
                    dataSource={blocks}
                    columns={columns}
                    rowKey="_id"
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Modal
                title={editingBlock ? 'Edit Block' : 'Add Block'}
                open={isModalOpen}
                onOk={handleSubmit}
                onCancel={() => setIsModalOpen(false)}
                okText="Save"
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Form.Item
                        name="blockName"
                        label="Block Name"
                        rules={[{ required: true, message: 'Please enter block name' }]}
                    >
                        <Input placeholder="Enter block name (e.g., Block A)" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default BlocksPage;
