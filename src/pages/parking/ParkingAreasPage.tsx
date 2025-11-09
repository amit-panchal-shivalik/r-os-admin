import { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Space, message, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getParkingAreas, createParkingArea, updateParkingArea, deleteParkingArea } from '../../apis/buildingSettings';

const ParkingAreasPage = () => {
    const [loading, setLoading] = useState(false);
    const [parkingAreas, setParkingAreas] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingArea, setEditingArea] = useState<any>(null);
    const [form] = Form.useForm();

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const buildingId = userInfo.buildingId;

    useEffect(() => {
        if (buildingId) {
            fetchParkingAreas();
        }
    }, [buildingId]);

    const fetchParkingAreas = async () => {
        try {
            setLoading(true);
            const response = await getParkingAreas(buildingId);
            setParkingAreas(response.data);
        } catch (error: any) {
            message.error(error.message || 'Failed to fetch parking areas');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingArea(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (record: any) => {
        setEditingArea(record);
        form.setFieldsValue({
            areaName: record.areaName,
            areaType: record.areaType,
            totalSpots: record.totalSpots,
            description: record.description
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteParkingArea(id);
            message.success('Parking area deleted successfully');
            fetchParkingAreas();
        } catch (error: any) {
            message.error(error.message || 'Failed to delete parking area');
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const data = {
                ...values,
                buildingId
            };

            if (editingArea) {
                await updateParkingArea(editingArea._id, data);
                message.success('Parking area updated successfully');
            } else {
                await createParkingArea(data);
                message.success('Parking area created successfully');
            }

            setIsModalOpen(false);
            fetchParkingAreas();
        } catch (error: any) {
            message.error(error.message || 'Failed to save parking area');
        }
    };

    const columns = [
        {
            title: 'Area Name',
            dataIndex: 'areaName',
            key: 'areaName',
        },
        {
            title: 'Area Type',
            dataIndex: 'areaType',
            key: 'areaType',
            render: (type: string) => (
                <Tag color={type === 'covered' ? 'blue' : type === 'open' ? 'green' : 'orange'}>
                    {type?.toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Total Spots',
            dataIndex: 'totalSpots',
            key: 'totalSpots',
        },
        {
            title: 'Available Spots',
            dataIndex: 'availableSpots',
            key: 'availableSpots',
            render: (available: number, record: any) => (
                <span className={available > 0 ? 'text-green-600' : 'text-red-600'}>
                    {available} / {record.totalSpots}
                </span>
            )
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true
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
                        title="Are you sure to delete this parking area?"
                        description="All parking spots in this area will also be deleted."
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
                    <h1 className="text-2xl font-bold text-gray-800">Parking Areas</h1>
                    <p className="text-gray-500">Manage parking areas and allocations</p>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                >
                    Add Parking Area
                </Button>
            </div>

            <Card>
                <Table
                    loading={loading}
                    dataSource={parkingAreas}
                    columns={columns}
                    rowKey="_id"
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Modal
                title={editingArea ? 'Edit Parking Area' : 'Add Parking Area'}
                open={isModalOpen}
                onOk={handleSubmit}
                onCancel={() => setIsModalOpen(false)}
                okText="Save"
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Form.Item
                        name="areaName"
                        label="Area Name"
                        rules={[{ required: true, message: 'Please enter area name' }]}
                    >
                        <Input placeholder="Enter area name (e.g., Basement Level 1)" />
                    </Form.Item>
                    <Form.Item
                        name="areaType"
                        label="Area Type"
                        rules={[{ required: true, message: 'Please select area type' }]}
                    >
                        <Select placeholder="Select area type">
                            <Select.Option value="covered">Covered</Select.Option>
                            <Select.Option value="open">Open</Select.Option>
                            <Select.Option value="basement">Basement</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="totalSpots"
                        label="Total Spots"
                        rules={[{ required: true, message: 'Please enter total spots' }]}
                    >
                        <Input type="number" min={1} placeholder="Enter total spots" />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="Description"
                    >
                        <Input.TextArea
                            rows={3}
                            placeholder="Enter description (optional)"
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ParkingAreasPage;
