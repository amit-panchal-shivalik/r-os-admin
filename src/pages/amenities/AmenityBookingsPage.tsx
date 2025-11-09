import { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Space, message, Tag, DatePicker, Row, Col } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, CalendarOutlined, UserOutlined, HomeOutlined, DollarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getAllBookings, updateBookingStatus } from '../../apis/amenities';
import { getAmenities } from '../../apis/amenities';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

const AmenityBookingsPage = () => {
    const [loading, setLoading] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [amenities, setAmenities] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
    const [form] = Form.useForm();

    // Filters
    const [filters, setFilters] = useState<any>({
        bookingStatus: undefined,
        amenityId: undefined,
        startDate: undefined,
        endDate: undefined
    });

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const buildingId = userInfo.buildingId;

    useEffect(() => {
        if (buildingId) {
            fetchBookings();
            fetchAmenities();
        }
    }, [buildingId, filters]);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const params: any = { buildingId };

            if (filters.bookingStatus) params.bookingStatus = filters.bookingStatus;
            if (filters.amenityId) params.amenityId = filters.amenityId;
            if (filters.startDate) params.startDate = filters.startDate;
            if (filters.endDate) params.endDate = filters.endDate;

            const response = await getAllBookings(params);
            setBookings(response.data);
        } catch (error: any) {
            message.error(error.message || 'Failed to fetch bookings');
        } finally {
            setLoading(false);
        }
    };

    const fetchAmenities = async () => {
        try {
            const response = await getAmenities(buildingId);
            setAmenities(response.data);
        } catch (error: any) {
            console.error('Failed to fetch amenities:', error);
        }
    };

    const handleApprove = (record: any) => {
        setSelectedBooking(record);
        form.setFieldsValue({ bookingStatus: 'confirmed' });
        setIsApprovalModalOpen(true);
    };

    const handleReject = (record: any) => {
        setSelectedBooking(record);
        form.setFieldsValue({ bookingStatus: 'rejected' });
        setIsApprovalModalOpen(true);
    };

    const handleSubmitApproval = async () => {
        try {
            const values = await form.validateFields();
            await updateBookingStatus(selectedBooking._id, values);
            message.success(`Booking ${values.bookingStatus} successfully`);
            setIsApprovalModalOpen(false);
            setSelectedBooking(null);
            form.resetFields();
            fetchBookings();
        } catch (error: any) {
            message.error(error.message || 'Failed to update booking status');
        }
    };

    const handleFilterChange = (key: string, value: any) => {
        setFilters((prev: any) => ({
            ...prev,
            [key]: value
        }));
    };

    const handleDateRangeChange = (dates: any) => {
        if (dates) {
            setFilters((prev: any) => ({
                ...prev,
                startDate: dates[0].format('YYYY-MM-DD'),
                endDate: dates[1].format('YYYY-MM-DD')
            }));
        } else {
            setFilters((prev: any) => ({
                ...prev,
                startDate: undefined,
                endDate: undefined
            }));
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'green';
            case 'pending':
                return 'orange';
            case 'rejected':
            case 'cancelled':
                return 'red';
            case 'completed':
                return 'blue';
            default:
                return 'default';
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
            case 'paid':
                return 'green';
            case 'pending':
                return 'orange';
            case 'failed':
                return 'red';
            default:
                return 'default';
        }
    };

    const columns = [
        {
            title: 'Booking ID',
            dataIndex: '_id',
            key: '_id',
            render: (id: string) => (
                <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                    {id.slice(-8).toUpperCase()}
                </span>
            )
        },
        {
            title: 'Amenity',
            dataIndex: 'amenityId',
            key: 'amenity',
            render: (amenity: any) => (
                <div>
                    <div style={{ fontWeight: 600 }}>{amenity?.name}</div>
                    {amenity?.amenityType && (
                        <Tag color={amenity.amenityType === 'paid' ? 'blue' : 'green'} style={{ marginTop: 4 }}>
                            {amenity.amenityType.toUpperCase()}
                        </Tag>
                    )}
                </div>
            )
        },
        {
            title: 'Resident',
            dataIndex: 'memberId',
            key: 'resident',
            render: (member: any) => (
                <div>
                    <div>
                        <UserOutlined /> {member?.firstName} {member?.lastName}
                    </div>
                    <div style={{ fontSize: '12px', color: '#888' }}>
                        <HomeOutlined /> Unit: {member?.unitId?.unitNumber || 'N/A'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#888' }}>
                        {member?.phoneNumber}
                    </div>
                </div>
            )
        },
        {
            title: 'Booking Date & Time',
            dataIndex: 'bookingDate',
            key: 'bookingDate',
            render: (_: any, record: any) => (
                <div>
                    <div>
                        <CalendarOutlined /> {dayjs(record.bookingDate).format('MMM DD, YYYY')}
                    </div>
                    {(record.startTime || record.endTime) && (
                        <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
                            ⏰ {record.startTime || '09:00'} - {record.endTime || '10:00'}
                        </div>
                    )}
                </div>
            ),
            sorter: (a: any, b: any) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime()
        },
        {
            title: 'Amount',
            dataIndex: 'bookingAmount',
            key: 'bookingAmount',
            render: (amount: number) => (
                <div style={{ fontWeight: 600 }}>
                    <DollarOutlined /> ₹{amount || 0}
                </div>
            )
        },
        {
            title: 'Payment Status',
            dataIndex: 'paymentStatus',
            key: 'paymentStatus',
            render: (status: string) => (
                <Tag color={getPaymentStatusColor(status)}>
                    {status?.toUpperCase() || 'PENDING'}
                </Tag>
            ),
            filters: [
                { text: 'Completed', value: 'completed' },
                { text: 'Pending', value: 'pending' },
                { text: 'Failed', value: 'failed' }
            ],
            onFilter: (value: any, record: any) => record.paymentStatus === value
        },
        {
            title: 'Booking Status',
            dataIndex: 'bookingStatus',
            key: 'bookingStatus',
            render: (status: string) => (
                <Tag color={getStatusColor(status)}>
                    {status?.toUpperCase() || 'PENDING'}
                </Tag>
            ),
            filters: [
                { text: 'Confirmed', value: 'confirmed' },
                { text: 'Pending', value: 'pending' },
                { text: 'Rejected', value: 'rejected' },
                { text: 'Cancelled', value: 'cancelled' },
                { text: 'Completed', value: 'completed' }
            ],
            onFilter: (value: any, record: any) => record.bookingStatus === value
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: any) => (
                <Space>
                    {record.bookingStatus === 'pending' && (
                        <>
                            <Button
                                type="primary"
                                size="small"
                                icon={<CheckCircleOutlined />}
                                onClick={() => handleApprove(record)}
                            >
                                Approve
                            </Button>
                            <Button
                                danger
                                size="small"
                                icon={<CloseCircleOutlined />}
                                onClick={() => handleReject(record)}
                            >
                                Reject
                            </Button>
                        </>
                    )}
                    {record.bookingStatus !== 'pending' && (
                        <Tag color={getStatusColor(record.bookingStatus)}>
                            {record.bookingStatus?.toUpperCase()}
                        </Tag>
                    )}
                </Space>
            )
        }
    ];

    const stats = {
        total: bookings.length,
        pending: bookings.filter((b: any) => b.bookingStatus === 'pending').length,
        confirmed: bookings.filter((b: any) => b.bookingStatus === 'confirmed').length,
        cancelled: bookings.filter((b: any) => b.bookingStatus === 'cancelled').length,
        revenue: bookings
            .filter((b: any) => b.paymentStatus === 'completed')
            .reduce((sum: number, b: any) => sum + (b.bookingAmount || 0), 0)
    };

    return (
        <div>
            <Card
                title="Amenity Bookings Management"
                extra={
                    <Space>
                        <Tag color="blue">Total: {stats.total}</Tag>
                        <Tag color="orange">Pending: {stats.pending}</Tag>
                        <Tag color="green">Confirmed: {stats.confirmed}</Tag>
                        <Tag color="purple">Revenue: ₹{stats.revenue}</Tag>
                    </Space>
                }
            >
                <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={6}>
                        <Select
                            placeholder="Filter by Status"
                            style={{ width: '100%' }}
                            allowClear
                            value={filters.bookingStatus}
                            onChange={(value) => handleFilterChange('bookingStatus', value)}
                        >
                            <Select.Option value="pending">Pending</Select.Option>
                            <Select.Option value="confirmed">Confirmed</Select.Option>
                            <Select.Option value="rejected">Rejected</Select.Option>
                            <Select.Option value="cancelled">Cancelled</Select.Option>
                            <Select.Option value="completed">Completed</Select.Option>
                        </Select>
                    </Col>
                    <Col span={6}>
                        <Select
                            placeholder="Filter by Amenity"
                            style={{ width: '100%' }}
                            allowClear
                            value={filters.amenityId}
                            onChange={(value) => handleFilterChange('amenityId', value)}
                        >
                            {amenities.map((amenity: any) => (
                                <Select.Option key={amenity._id} value={amenity._id}>
                                    {amenity.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={8}>
                        <RangePicker
                            style={{ width: '100%' }}
                            onChange={handleDateRangeChange}
                            placeholder={['Start Date', 'End Date']}
                        />
                    </Col>
                    <Col span={4}>
                        <Button
                            onClick={() => setFilters({
                                bookingStatus: undefined,
                                amenityId: undefined,
                                startDate: undefined,
                                endDate: undefined
                            })}
                        >
                            Clear Filters
                        </Button>
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={bookings}
                    rowKey="_id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} bookings`
                    }}
                />
            </Card>

            <Modal
                title={
                    form.getFieldValue('bookingStatus') === 'confirmed'
                        ? 'Approve Booking'
                        : 'Reject Booking'
                }
                open={isApprovalModalOpen}
                onOk={handleSubmitApproval}
                onCancel={() => {
                    setIsApprovalModalOpen(false);
                    setSelectedBooking(null);
                    form.resetFields();
                }}
                okText={form.getFieldValue('bookingStatus') === 'confirmed' ? 'Approve' : 'Reject'}
                okButtonProps={{
                    danger: form.getFieldValue('bookingStatus') === 'rejected'
                }}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="bookingStatus" hidden>
                        <Input />
                    </Form.Item>

                    {selectedBooking && (
                        <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                            <div><strong>Amenity:</strong> {selectedBooking.amenityId?.name}</div>
                            <div><strong>Resident:</strong> {selectedBooking.memberId?.firstName} {selectedBooking.memberId?.lastName}</div>
                            <div><strong>Date:</strong> {dayjs(selectedBooking.bookingDate).format('MMM DD, YYYY')}</div>
                            {(selectedBooking.startTime || selectedBooking.endTime) && (
                                <div><strong>Time:</strong> {selectedBooking.startTime || '09:00'} - {selectedBooking.endTime || '10:00'}</div>
                            )}
                            <div><strong>Amount:</strong> ₹{selectedBooking.bookingAmount || 0}</div>
                        </div>
                    )}

                    {form.getFieldValue('bookingStatus') === 'rejected' && (
                        <Form.Item
                            name="rejectionReason"
                            label="Rejection Reason"
                            rules={[{ required: true, message: 'Please provide a reason for rejection' }]}
                        >
                            <TextArea
                                rows={4}
                                placeholder="Enter reason for rejecting this booking..."
                            />
                        </Form.Item>
                    )}

                    {form.getFieldValue('bookingStatus') === 'confirmed' && (
                        <p>Are you sure you want to approve this booking?</p>
                    )}
                </Form>
            </Modal>
        </div>
    );
};

export default AmenityBookingsPage;
