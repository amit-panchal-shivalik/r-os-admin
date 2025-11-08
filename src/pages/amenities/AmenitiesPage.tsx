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
            amenityName: record.amenityName,
            amenityType: record.amenityType,
            description: record.description,
            location: record.location,
            capacity: record.capacity,
            bookingType: record.bookingType,
            pricePerSlot: record.pricePerSlot,
            advanceBookingDays: record.advanceBookingDays,
            status: record.status
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
                ...values,
                buildingId,
                images: [] // Mock images
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
            title: 'Amenity Name',
            dataIndex: 'amenityName',
            key: 'amenityName',
        },
        {
            title: 'Type',
            dataIndex: 'amenityType',
            key: 'amenityType',
            render: (type: string) => (
                <Tag color="blue">{type?.toUpperCase()}</Tag>
            )
        },
        {
            title: 'Location',
            dataIndex: 'location',
            key: 'location',
        },
        {
            title: 'Capacity',
            dataIndex: 'capacity',
            key: 'capacity',
        },
        {
            title: 'Booking Type',
            dataIndex: 'bookingType',
            key: 'bookingType',
            render: (type: string) => (
                <Tag color={type === 'slot' ? 'green' : 'orange'}>
                    {type?.toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Price/Slot',
            dataIndex: 'pricePerSlot',
            key: 'pricePerSlot',
            render: (price: number) => `₹${price || 0}`
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
                        name="amenityName"
                        label="Amenity Name"
                        rules={[{ required: true, message: 'Please enter amenity name' }]}
                    >
                        <Input placeholder="Enter amenity name (e.g., Swimming Pool)" />
                    </Form.Item>
                    <Form.Item
                        name="amenityType"
                        label="Amenity Type"
                        rules={[{ required: true, message: 'Please select amenity type' }]}
                    >
                        <Select placeholder="Select amenity type">
                            <Select.Option value="gym">Gym</Select.Option>
                            <Select.Option value="pool">Swimming Pool</Select.Option>
                            <Select.Option value="clubhouse">Clubhouse</Select.Option>
                            <Select.Option value="hall">Community Hall</Select.Option>
                            <Select.Option value="playground">Playground</Select.Option>
                            <Select.Option value="park">Park</Select.Option>
                            <Select.Option value="other">Other</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="Description"
                    >
                        <TextArea
                            rows={3}
                            placeholder="Enter description"
                        />
                    </Form.Item>
                    <Form.Item
                        name="location"
                        label="Location"
                        rules={[{ required: true, message: 'Please enter location' }]}
                    >
                        <Input placeholder="Enter location (e.g., Ground Floor, Block A)" />
                    </Form.Item>
                    <Form.Item
                        name="capacity"
                        label="Capacity"
                        rules={[{ required: true, message: 'Please enter capacity' }]}
                    >
                        <InputNumber
                            min={1}
                            placeholder="Enter capacity"
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                    <Form.Item
                        name="bookingType"
                        label="Booking Type"
                        rules={[{ required: true, message: 'Please select booking type' }]}
                    >
                        <Select placeholder="Select booking type">
                            <Select.Option value="slot">Slot-based Booking</Select.Option>
                            <Select.Option value="full_day">Full Day Booking</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="pricePerSlot"
                        label="Price Per Slot (₹)"
                        initialValue={0}
                    >
                        <InputNumber
                            min={0}
                            placeholder="Enter price"
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                    <Form.Item
                        name="advanceBookingDays"
                        label="Advance Booking Days"
                        initialValue={7}
                    >
                        <InputNumber
                            min={1}
                            max={90}
                            placeholder="Enter advance booking days"
                            style={{ width: '100%' }}
                        />
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

export default AmenitiesPage;
