import { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Space, message, Popconfirm, Tag, Upload, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, CalendarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getAmenities, createAmenity, updateAmenity, deleteAmenity } from '../../apis/amenities';

const { TextArea } = Input;

const AmenitiesPage = () => {
    const [loading, setLoading] = useState(false);
    const [amenities, setAmenities] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAmenity, setEditingAmenity] = useState<any>(null);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const buildingId = userInfo.buildingId;

    useEffect(() => {
        if (buildingId) {
            fetchAmenities();
        }
    }, [buildingId]);

    const fetchAmenities = async () => {
        try {
            setLoading(true);
            const response = await getAmenities(buildingId);
            setAmenities(response.data);
        } catch (error: any) {
            message.error(error.message || 'Failed to fetch amenities');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingAmenity(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (record: any) => {
        setEditingAmenity(record);
        form.setFieldsValue({
            name: record.name,
            description: record.description,
            imageUrl: record.images?.[0] || '',
            capacity: record.capacity,
            amenityType: record.amenityType,
            bookingCharge: record.bookingCharge,
            bookingType: record.bookingType,
            advanceBookingDays: record.advanceBookingDays,
            requiresApproval: record.requiresApproval,
            amenityStatus: record.amenityStatus
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteAmenity(id);
            message.success('Amenity deleted successfully');
            fetchAmenities();
        } catch (error: any) {
            message.error(error.message || 'Failed to delete amenity');
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const data = {
                name: values.name,
                description: values.description,
                images: values.imageUrl ? [values.imageUrl] : [],
                capacity: values.capacity,
                amenityType: values.amenityType,
                bookingCharge: values.bookingCharge || 0,
                bookingType: values.bookingType,
                paymentGateway: 'none',
                advanceBookingDays: values.advanceBookingDays || 7,
                requiresApproval: values.requiresApproval !== undefined ? values.requiresApproval : false,
                buildingId,
                amenityStatus: values.amenityStatus || 'available',
                status: 'active'
            };

            if (editingAmenity) {
                await updateAmenity(editingAmenity._id, data);
                message.success('Amenity updated successfully');
            } else {
                await createAmenity(data);
                message.success('Amenity created successfully');
            }

            setIsModalOpen(false);
            fetchAmenities();
        } catch (error: any) {
            message.error(error.message || 'Failed to save amenity');
        }
    };

    const handleManageSlots = (amenityId: string) => {
        navigate(`/amenities/${amenityId}/slots`);
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name'
        },
        {
            title: 'Type',
            dataIndex: 'amenityType',
            key: 'amenityType',
            render: (type: string) => (
                <Tag color={type === 'paid' ? 'green' : 'blue'}>
                    {type === 'paid' ? 'PAID' : 'FREE'}
                </Tag>
            )
        },
        {
            title: 'Charge',
            dataIndex: 'bookingCharge',
            key: 'bookingCharge',
            render: (charge: number) => `₹${charge || 0}`
        },
        {
            title: 'Capacity',
            dataIndex: 'capacity',
            key: 'capacity'
        },
        {
            title: 'Status',
            dataIndex: 'amenityStatus',
            key: 'amenityStatus',
            render: (status: string) => (
                <Tag color={status === 'available' ? 'green' : status === 'maintenance' ? 'orange' : 'red'}>
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
            width: 280,
            render: (_: any, record: any) => (
                <Space>
                    {record.bookingType === 'slot' && (
                        <Button
                            type="link"
                            size="small"
                            icon={<CalendarOutlined />}
                            onClick={() => handleManageSlots(record._id)}
                        >
                            Slots
                        </Button>
                    )}
                    <Button
                        type="link"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Are you sure to delete this amenity?"
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
                    <h1 className="text-2xl font-bold text-gray-800">Amenities</h1>
                    <p className="text-gray-500">Manage building amenities and bookings</p>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                >
                    Add Amenity
                </Button>
            </div>

            <Card>
                <Table
                    loading={loading}
                    dataSource={amenities}
                    columns={columns}
                    rowKey="_id"
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 1200 }}
                />
            </Card>

            <Modal
                title={editingAmenity ? 'Edit Amenity' : 'Add Amenity'}
                open={isModalOpen}
                onOk={handleSubmit}
                onCancel={() => setIsModalOpen(false)}
                okText="Save"
                width={700}
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Form.Item
                        name="name"
                        label="Amenity Name"
                        rules={[{ required: true, message: 'Please enter amenity name' }]}
                    >
                        <Input placeholder="E.g., Swimming Pool, Gym, Club House" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[{ required: true, message: 'Please enter description' }]}
                    >
                        <TextArea
                            rows={3}
                            placeholder="Enter amenity description"
                        />
                    </Form.Item>

                    <Form.Item
                        name="imageUrl"
                        label="Image URL"
                        tooltip="Paste an image URL from the internet"
                    >
                        <Input placeholder="https://example.com/image.jpg" />
                    </Form.Item>

                    <Form.Item
                        name="capacity"
                        label="Capacity"
                        rules={[{ required: true, message: 'Please enter capacity' }]}
                    >
                        <InputNumber
                            min={1}
                            placeholder="Maximum number of people"
                            style={{ width: '100%' }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="amenityType"
                        label="Payment Type"
                        rules={[{ required: true, message: 'Please select payment type' }]}
                        initialValue="free"
                    >
                        <Select placeholder="Select payment type">
                            <Select.Option value="free">Free</Select.Option>
                            <Select.Option value="paid">Paid</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="bookingCharge"
                        label="Booking Charge (₹)"
                        initialValue={0}
                    >
                        <InputNumber
                            min={0}
                            placeholder="Enter booking charge"
                            style={{ width: '100%' }}
                            prefix="₹"
                        />
                    </Form.Item>

                    <Form.Item
                        name="bookingType"
                        label="Booking Type"
                        rules={[{ required: true, message: 'Please select booking type' }]}
                        initialValue="one-time"
                    >
                        <Select placeholder="Select booking type">
                            <Select.Option value="one-time">One-time Booking</Select.Option>
                            <Select.Option value="recurring">Recurring Booking</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="advanceBookingDays"
                        label="Advance Booking Days"
                        initialValue={7}
                    >
                        <InputNumber
                            min={1}
                            max={90}
                            placeholder="How many days in advance can residents book?"
                            style={{ width: '100%' }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="requiresApproval"
                        label="Requires Admin Approval"
                        initialValue={false}
                    >
                        <Select placeholder="Select approval requirement">
                            <Select.Option value={true}>Yes - Requires Approval</Select.Option>
                            <Select.Option value={false}>No - Auto Approve</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="amenityStatus"
                        label="Amenity Status"
                        initialValue="available"
                    >
                        <Select placeholder="Select status">
                            <Select.Option value="available">Available</Select.Option>
                            <Select.Option value="maintenance">Under Maintenance</Select.Option>
                            <Select.Option value="unavailable">Unavailable</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AmenitiesPage;
