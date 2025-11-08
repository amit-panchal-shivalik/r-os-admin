import { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Select, Space, message, Tag, DatePicker, TimePicker, Row, Col } from 'antd';
import { PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { getAmenitySlots, createAmenitySlot, updateAmenitySlot, getAmenityById } from '../../apis/amenities';
import dayjs from 'dayjs';

const AmenitySlotsPage = () => {
    const [loading, setLoading] = useState(false);
    const [slots, setSlots] = useState([]);
    const [amenity, setAmenity] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const { amenityId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (amenityId) {
            fetchAmenity();
            fetchSlots();
        }
    }, [amenityId]);

    const fetchAmenity = async () => {
        try {
            const response = await getAmenityById(amenityId!);
            setAmenity(response.data);
        } catch (error: any) {
            message.error('Failed to fetch amenity details');
        }
    };

    const fetchSlots = async () => {
        try {
            setLoading(true);
            const response = await getAmenitySlots({ amenityId });
            setSlots(response.data);
        } catch (error: any) {
            message.error(error.message || 'Failed to fetch slots');
        } finally {
            setLoading(false);
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
                amenityId,
                slotDate: values.slotDate.format('YYYY-MM-DD'),
                startTime: values.startTime.format('HH:mm'),
                endTime: values.endTime.format('HH:mm'),
                slotStatus: values.slotStatus || 'available'
            };

            await createAmenitySlot(data);
            message.success('Slot created successfully');
            setIsModalOpen(false);
            fetchSlots();
        } catch (error: any) {
            message.error(error.message || 'Failed to create slot');
        }
    };

    const handleStatusChange = async (slotId: string, newStatus: string) => {
        try {
            await updateAmenitySlot(slotId, { slotStatus: newStatus });
            message.success('Slot status updated successfully');
            fetchSlots();
        } catch (error: any) {
            message.error(error.message || 'Failed to update slot status');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available':
                return 'green';
            case 'booked':
                return 'blue';
            case 'blocked':
                return 'red';
            case 'completed':
                return 'gray';
            default:
                return 'default';
        }
    };

    const columns = [
        {
            title: 'Date',
            dataIndex: 'slotDate',
            key: 'slotDate',
            render: (date: string) => new Date(date).toLocaleDateString()
        },
        {
            title: 'Start Time',
            dataIndex: 'startTime',
            key: 'startTime',
        },
        {
            title: 'End Time',
            dataIndex: 'endTime',
            key: 'endTime',
        },
        {
            title: 'Status',
            dataIndex: 'slotStatus',
            key: 'slotStatus',
            render: (status: string) => (
                <Tag color={getStatusColor(status)}>
                    {status?.toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Booked By',
            key: 'bookedBy',
            render: (_: any, record: any) => {
                if (record.memberId) {
                    return `${record.memberId.firstName} ${record.memberId.lastName}`;
                }
                if (record.unitId) {
                    return `Unit ${record.unitId.unitNumber}`;
                }
                return '-';
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: any) => (
                <Space>
                    {record.slotStatus === 'available' && (
                        <Button
                            type="link"
                            size="small"
                            danger
                            onClick={() => handleStatusChange(record._id, 'blocked')}
                        >
                            Block
                        </Button>
                    )}
                    {record.slotStatus === 'blocked' && (
                        <Button
                            type="link"
                            size="small"
                            onClick={() => handleStatusChange(record._id, 'available')}
                        >
                            Unblock
                        </Button>
                    )}
                    {record.slotStatus === 'booked' && (
                        <Button
                            type="link"
                            size="small"
                            onClick={() => handleStatusChange(record._id, 'completed')}
                        >
                            Complete
                        </Button>
                    )}
                </Space>
            )
        }
    ];

    return (
        <div className="p-6">
            <div className="mb-6">
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/amenities')}
                    className="mb-4"
                >
                    Back to Amenities
                </Button>
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            {amenity?.amenityName} - Slot Management
                        </h1>
                        <p className="text-gray-500">Manage booking slots for this amenity</p>
                    </div>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAdd}
                    >
                        Add Slot
                    </Button>
                </div>
            </div>

            {amenity && (
                <Card className="mb-4">
                    <Row gutter={16}>
                        <Col span={6}>
                            <div className="text-gray-500">Type</div>
                            <div className="text-lg font-semibold">{amenity.amenityType}</div>
                        </Col>
                        <Col span={6}>
                            <div className="text-gray-500">Location</div>
                            <div className="text-lg font-semibold">{amenity.location}</div>
                        </Col>
                        <Col span={6}>
                            <div className="text-gray-500">Capacity</div>
                            <div className="text-lg font-semibold">{amenity.capacity}</div>
                        </Col>
                        <Col span={6}>
                            <div className="text-gray-500">Price/Slot</div>
                            <div className="text-lg font-semibold">₹{amenity.pricePerSlot || 0}</div>
                        </Col>
                    </Row>
                </Card>
            )}

            <Card>
                <Table
                    loading={loading}
                    dataSource={slots}
                    columns={columns}
                    rowKey="_id"
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Modal
                title="Add Slot"
                open={isModalOpen}
                onOk={handleSubmit}
                onCancel={() => setIsModalOpen(false)}
                okText="Save"
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Form.Item
                        name="slotDate"
                        label="Date"
                        rules={[{ required: true, message: 'Please select date' }]}
                    >
                        <DatePicker
                            style={{ width: '100%' }}
                            disabledDate={(current) => current && current < dayjs().startOf('day')}
                        />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="startTime"
                                label="Start Time"
                                rules={[{ required: true, message: 'Please select start time' }]}
                            >
                                <TimePicker
                                    style={{ width: '100%' }}
                                    format="HH:mm"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="endTime"
                                label="End Time"
                                rules={[{ required: true, message: 'Please select end time' }]}
                            >
                                <TimePicker
                                    style={{ width: '100%' }}
                                    format="HH:mm"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item
                        name="slotStatus"
                        label="Initial Status"
                        initialValue="available"
                    >
                        <Select placeholder="Select initial status">
                            <Select.Option value="available">Available</Select.Option>
                            <Select.Option value="blocked">Blocked</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AmenitySlotsPage;
