import { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Space, message, Tag, DatePicker, TimePicker, Upload, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, TeamOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getEvents, createEvent, updateEvent, deleteEvent, publishEvent } from '../../apis/events';
import { getBlocks } from '../../apis/buildingSettings';
import dayjs from 'dayjs';

const { TextArea } = Input;

const EventsPage = () => {
    const [loading, setLoading] = useState(false);
    const [events, setEvents] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<any>(null);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const buildingId = userInfo.buildingId;

    useEffect(() => {
        if (buildingId) {
            fetchBlocks();
            fetchEvents();
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

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await getEvents(buildingId);
            setEvents(response.data);
        } catch (error: any) {
            message.error(error.message || 'Failed to fetch events');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingEvent(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (record: any) => {
        setEditingEvent(record);
        form.setFieldsValue({
            title: record.title,
            description: record.description,
            venue: record.venue,
            eventDate: record.eventDate ? dayjs(record.eventDate) : null,
            startTime: record.startTime ? dayjs(record.startTime, 'HH:mm') : null,
            endTime: record.endTime ? dayjs(record.endTime, 'HH:mm') : null,
            registrationLimit: record.registrationLimit,
            targetUserTypes: record.targetUserTypes,
            blockIds: record.blockIds?.map((block: any) => block._id)
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteEvent(id);
            message.success('Event deleted successfully');
            fetchEvents();
        } catch (error: any) {
            message.error(error.message || 'Failed to delete event');
        }
    };

    const handlePublish = async (id: string, currentStatus: string) => {
        try {
            const newStatus = currentStatus === 'published' ? 'draft' : 'published';
            await publishEvent(id, newStatus);
            message.success(`Event ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`);
            fetchEvents();
        } catch (error: any) {
            message.error(error.message || 'Failed to update event status');
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const data = {
                ...values,
                buildingId,
                eventDate: values.eventDate ? values.eventDate.format('YYYY-MM-DD') : null,
                startTime: values.startTime ? values.startTime.format('HH:mm') : null,
                endTime: values.endTime ? values.endTime.format('HH:mm') : null,
                banner: '' // Image upload to be implemented
            };

            if (editingEvent) {
                await updateEvent(editingEvent._id, data);
                message.success('Event updated successfully');
            } else {
                await createEvent(data);
                message.success('Event created successfully');
            }

            setIsModalOpen(false);
            fetchEvents();
        } catch (error: any) {
            message.error(error.message || 'Failed to save event');
        }
    };

    const handleViewRegistrations = (eventId: string) => {
        navigate(`/events/${eventId}/registrations`);
    };

    const getStatusColor = (status: string) => {
        const colors: any = {
            'draft': 'orange',
            'published': 'blue',
            'ongoing': 'green',
            'completed': 'default',
            'cancelled': 'red'
        };
        return colors[status] || 'default';
    };

    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Event Date',
            dataIndex: 'eventDate',
            key: 'eventDate',
            render: (date: string) => new Date(date).toLocaleDateString()
        },
        {
            title: 'Time',
            key: 'time',
            render: (_: any, record: any) => `${record.startTime} - ${record.endTime}`
        },
        {
            title: 'Venue',
            dataIndex: 'venue',
            key: 'venue',
        },
        {
            title: 'Registration',
            key: 'registration',
            render: (_: any, record: any) => (
                <span>
                    {record.registrationCount || 0} / {record.registrationLimit || '∞'}
                </span>
            )
        },
        {
            title: 'Target Audience',
            dataIndex: 'targetUserTypes',
            key: 'targetUserTypes',
            render: (types: string[]) => (
                <Space wrap>
                    {types?.map((type: string) => (
                        <Tag key={type} color="blue" size="small">
                            {type.toUpperCase()}
                        </Tag>
                    ))}
                </Space>
            )
        },
        {
            title: 'Status',
            dataIndex: 'eventStatus',
            key: 'eventStatus',
            render: (status: string) => (
                <Tag color={getStatusColor(status)}>
                    {status?.toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            fixed: 'right',
            width: 300,
            render: (_: any, record: any) => (
                <Space>
                    <Button
                        type="link"
                        size="small"
                        icon={<TeamOutlined />}
                        onClick={() => handleViewRegistrations(record._id)}
                    >
                        Registrations
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => handlePublish(record._id, record.eventStatus)}
                    >
                        {record.eventStatus === 'published' ? 'Unpublish' : 'Publish'}
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Edit
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record._id)}
                    >
                        Delete
                    </Button>
                </Space>
            )
        }
    ];

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Events</h1>
                    <p className="text-gray-500">Manage community events and registrations</p>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                >
                    Add Event
                </Button>
            </div>

            <Card>
                <Table
                    loading={loading}
                    dataSource={events}
                    columns={columns}
                    rowKey="_id"
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 1400 }}
                />
            </Card>

            <Modal
                title={editingEvent ? 'Edit Event' : 'Add Event'}
                open={isModalOpen}
                onOk={handleSubmit}
                onCancel={() => setIsModalOpen(false)}
                okText="Save"
                width={800}
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Form.Item
                        name="title"
                        label="Event Title"
                        rules={[{ required: true, message: 'Please enter event title' }]}
                    >
                        <Input placeholder="Enter event title" />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[{ required: true, message: 'Please enter description' }]}
                    >
                        <TextArea
                            rows={4}
                            placeholder="Enter event description"
                        />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="venue"
                                label="Venue"
                                rules={[{ required: true, message: 'Please enter venue' }]}
                            >
                                <Input placeholder="Enter venue" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="eventDate"
                                label="Event Date"
                                rules={[{ required: true, message: 'Please select date' }]}
                            >
                                <DatePicker
                                    style={{ width: '100%' }}
                                    disabledDate={(current) => current && current < dayjs().startOf('day')}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="startTime"
                                label="Start Time"
                                rules={[{ required: true, message: 'Please select start time' }]}
                            >
                                <TimePicker style={{ width: '100%' }} format="HH:mm" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="endTime"
                                label="End Time"
                                rules={[{ required: true, message: 'Please select end time' }]}
                            >
                                <TimePicker style={{ width: '100%' }} format="HH:mm" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item
                        name="registrationLimit"
                        label="Registration Limit (Optional)"
                    >
                        <Input type="number" placeholder="Enter max registrations (leave empty for unlimited)" />
                    </Form.Item>
                    <Form.Item
                        name="targetUserTypes"
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
                        label="Event Banner"
                        tooltip="Image upload feature coming soon"
                    >
                        <Upload
                            listType="picture-card"
                            beforeUpload={() => {
                                message.info('Image upload feature will be implemented soon');
                                return false;
                            }}
                        >
                            <div>
                                <UploadOutlined />
                                <div style={{ marginTop: 8 }}>Upload</div>
                            </div>
                        </Upload>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default EventsPage;
