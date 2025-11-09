import { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Space, message, Popconfirm, InputNumber, Tabs } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, AppstoreAddOutlined } from '@ant-design/icons';
import { getFloors, createFloor, createMultipleFloors, updateFloor, deleteFloor, getBlocks } from '../../apis/buildingSettings';

const FloorsPage = () => {
    const [loading, setLoading] = useState(false);
    const [floors, setFloors] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [editingFloor, setEditingFloor] = useState<any>(null);
    const [form] = Form.useForm();
    const [bulkForm] = Form.useForm();

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const buildingId = userInfo.buildingId;

    useEffect(() => {
        if (buildingId) {
            fetchBlocks();
            fetchFloors();
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

    const fetchFloors = async () => {
        try {
            setLoading(true);
            const response = await getFloors();
            setFloors(response.data);
        } catch (error: any) {
            message.error(error.message || 'Failed to fetch floors');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingFloor(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleBulkAdd = () => {
        bulkForm.resetFields();
        setIsBulkModalOpen(true);
    };

    const handleEdit = (record: any) => {
        setEditingFloor(record);
        form.setFieldsValue({
            floorName: record.floorName,
            blockId: record.blockId?._id
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteFloor(id);
            message.success('Floor deleted successfully');
            fetchFloors();
        } catch (error: any) {
            message.error(error.message || 'Failed to delete floor');
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            if (editingFloor) {
                await updateFloor(editingFloor._id, values);
                message.success('Floor updated successfully');
            } else {
                await createFloor(values);
                message.success('Floor created successfully');
            }

            setIsModalOpen(false);
            fetchFloors();
        } catch (error: any) {
            message.error(error.message || 'Failed to save floor');
        }
    };

    const handleBulkSubmit = async () => {
        try {
            const values = await bulkForm.validateFields();
            await createMultipleFloors(values);
            message.success(`${values.numberOfFloors} floors created successfully`);
            setIsBulkModalOpen(false);
            fetchFloors();
        } catch (error: any) {
            message.error(error.message || 'Failed to create floors');
        }
    };

    const columns = [
        {
            title: 'Floor Name',
            dataIndex: 'floorName',
            key: 'floorName',
        },
        {
            title: 'Block',
            dataIndex: ['blockId', 'blockName'],
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
                        title="Are you sure to delete this floor?"
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
                    <h1 className="text-2xl font-bold text-gray-800">Floors</h1>
                    <p className="text-gray-500">Manage building floors</p>
                </div>
                <Space>
                    <Button
                        icon={<AppstoreAddOutlined />}
                        onClick={handleBulkAdd}
                    >
                        Bulk Create
                    </Button>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAdd}
                    >
                        Add Floor
                    </Button>
                </Space>
            </div>

            <Card>
                <Table
                    loading={loading}
                    dataSource={floors}
                    columns={columns}
                    rowKey="_id"
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Modal
                title={editingFloor ? 'Edit Floor' : 'Add Floor'}
                open={isModalOpen}
                onOk={handleSubmit}
                onCancel={() => setIsModalOpen(false)}
                okText="Save"
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Form.Item
                        name="blockId"
                        label="Block"
                        rules={[{ required: true, message: 'Please select block' }]}
                    >
                        <Select placeholder="Select block">
                            {blocks.map((block: any) => (
                                <Select.Option key={block._id} value={block._id}>
                                    {block.blockName}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="floorName"
                        label="Floor Name"
                        rules={[{ required: true, message: 'Please enter floor name' }]}
                    >
                        <Input placeholder="Enter floor name (e.g., Ground Floor)" />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Bulk Create Floors"
                open={isBulkModalOpen}
                onOk={handleBulkSubmit}
                onCancel={() => setIsBulkModalOpen(false)}
                okText="Create"
            >
                <Form form={bulkForm} layout="vertical" className="mt-4">
                    <Form.Item
                        name="blockId"
                        label="Block"
                        rules={[{ required: true, message: 'Please select block' }]}
                    >
                        <Select placeholder="Select block">
                            {blocks.map((block: any) => (
                                <Select.Option key={block._id} value={block._id}>
                                    {block.blockName}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="floorPrefix"
                        label="Floor Prefix"
                        rules={[{ required: true, message: 'Please enter prefix' }]}
                        initialValue="Floor"
                    >
                        <Input placeholder="Enter prefix (e.g., Floor)" />
                    </Form.Item>
                    <Form.Item
                        name="numberOfFloors"
                        label="Number of Floors"
                        rules={[{ required: true, message: 'Please enter number' }]}
                    >
                        <InputNumber min={1} max={100} placeholder="Enter number" style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default FloorsPage;
