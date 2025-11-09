import { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Select, Space, message, Tag, Row, Col, Statistic } from 'antd';
import { CarOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { getParkingDashboard, getParkingRequests, approveParkingRequest, rejectParkingRequest } from '../../apis/parking';

const ParkingRequestsPage = () => {
    const [loading, setLoading] = useState(false);
    const [requests, setRequests] = useState([]);
    const [dashboardStats, setDashboardStats] = useState<any>(null);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [approveForm] = Form.useForm();
    const [rejectForm] = Form.useForm();

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const buildingId = userInfo.buildingId;

    useEffect(() => {
        if (buildingId) {
            fetchDashboard();
            fetchRequests();
        }
    }, [buildingId]);

    const fetchDashboard = async () => {
        try {
            const response = await getParkingDashboard(buildingId);
            setDashboardStats(response.data);
        } catch (error: any) {
            message.error('Failed to fetch dashboard stats');
        }
    };

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await getParkingRequests(buildingId);
            setRequests(response.data);
        } catch (error: any) {
            message.error(error.message || 'Failed to fetch parking requests');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = (record: any) => {
        setSelectedRequest(record);
        approveForm.resetFields();
        setIsApproveModalOpen(true);
    };

    const handleReject = (record: any) => {
        setSelectedRequest(record);
        rejectForm.resetFields();
        setIsRejectModalOpen(true);
    };

    const handleApproveSubmit = async () => {
        try {
            const values = await approveForm.validateFields();
            await approveParkingRequest(selectedRequest._id, values);
            message.success('Parking request approved successfully');
            setIsApproveModalOpen(false);
            fetchRequests();
            fetchDashboard();
        } catch (error: any) {
            message.error(error.message || 'Failed to approve request');
        }
    };

    const handleRejectSubmit = async () => {
        try {
            const values = await rejectForm.validateFields();
            await rejectParkingRequest(selectedRequest._id, values);
            message.success('Parking request rejected');
            setIsRejectModalOpen(false);
            fetchRequests();
            fetchDashboard();
        } catch (error: any) {
            message.error(error.message || 'Failed to reject request');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'orange';
            case 'approved':
                return 'green';
            case 'rejected':
                return 'red';
            default:
                return 'default';
        }
    };

    const columns = [
        {
            title: 'Unit',
            dataIndex: ['unitId', 'unitNumber'],
            key: 'unitNumber',
        },
        {
            title: 'Member',
            key: 'member',
            render: (_: any, record: any) => {
                if (record.memberId) {
                    return `${record.memberId.firstName} ${record.memberId.lastName}`;
                }
                return '-';
            }
        },
        {
            title: 'Vehicle Type',
            dataIndex: 'vehicleType',
            key: 'vehicleType',
            render: (type: string) => (
                <Tag color={type === 'car' ? 'blue' : 'green'}>
                    {type?.toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Vehicle Number',
            dataIndex: 'vehicleNumber',
            key: 'vehicleNumber',
        },
        {
            title: 'Requested Spot',
            dataIndex: ['requestedSpotId', 'spotNumber'],
            key: 'spotNumber',
            render: (spot: string) => spot || '-'
        },
        {
            title: 'Status',
            dataIndex: 'requestStatus',
            key: 'requestStatus',
            render: (status: string) => (
                <Tag color={getStatusColor(status)}>
                    {status?.toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Request Date',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => new Date(date).toLocaleDateString()
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: any) => (
                <Space>
                    {record.requestStatus === 'pending' && (
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
                    {record.requestStatus === 'approved' && record.assignedSpotId && (
                        <Tag color="green">
                            Spot: {record.assignedSpotId.spotNumber}
                        </Tag>
                    )}
                </Space>
            )
        }
    ];

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Parking Requests</h1>
                <p className="text-gray-500">Manage parking spot allocation requests</p>
            </div>

            {dashboardStats && (
                <Row gutter={[16, 16]} className="mb-6">
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Total Spots"
                                value={dashboardStats.totalSpots}
                                prefix={<CarOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card className="bg-green-50 border-green-200">
                            <Statistic
                                title="Available"
                                value={dashboardStats.availableSpots}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card className="bg-blue-50 border-blue-200">
                            <Statistic
                                title="Occupied"
                                value={dashboardStats.occupiedSpots}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card className="bg-orange-50 border-orange-200">
                            <Statistic
                                title="Pending Requests"
                                value={dashboardStats.pendingRequests}
                                valueStyle={{ color: '#fa8c16' }}
                            />
                        </Card>
                    </Col>
                </Row>
            )}

            <Card>
                <Table
                    loading={loading}
                    dataSource={requests}
                    columns={columns}
                    rowKey="_id"
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            {/* Approve Modal */}
            <Modal
                title="Approve Parking Request"
                open={isApproveModalOpen}
                onOk={handleApproveSubmit}
                onCancel={() => setIsApproveModalOpen(false)}
                okText="Approve"
            >
                {selectedRequest && (
                    <div className="mb-4">
                        <p><strong>Unit:</strong> {selectedRequest.unitId?.unitNumber}</p>
                        <p><strong>Vehicle:</strong> {selectedRequest.vehicleType} - {selectedRequest.vehicleNumber}</p>
                    </div>
                )}
                <Form form={approveForm} layout="vertical">
                    <Form.Item
                        name="assignedSpotId"
                        label="Assign Parking Spot"
                        rules={[{ required: true, message: 'Please select a parking spot' }]}
                    >
                        <Select placeholder="Select available parking spot">
                            {/* This would be populated with available spots from API */}
                            <Select.Option value="spot1">Spot A1</Select.Option>
                            <Select.Option value="spot2">Spot A2</Select.Option>
                            <Select.Option value="spot3">Spot B1</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Reject Modal */}
            <Modal
                title="Reject Parking Request"
                open={isRejectModalOpen}
                onOk={handleRejectSubmit}
                onCancel={() => setIsRejectModalOpen(false)}
                okText="Reject"
                okButtonProps={{ danger: true }}
            >
                {selectedRequest && (
                    <div className="mb-4">
                        <p><strong>Unit:</strong> {selectedRequest.unitId?.unitNumber}</p>
                        <p><strong>Vehicle:</strong> {selectedRequest.vehicleType} - {selectedRequest.vehicleNumber}</p>
                    </div>
                )}
                <Form form={rejectForm} layout="vertical">
                    <Form.Item
                        name="rejectionReason"
                        label="Reason for Rejection"
                        rules={[{ required: true, message: 'Please provide a reason' }]}
                    >
                        <Select placeholder="Select rejection reason">
                            <Select.Option value="no_spots">No Available Spots</Select.Option>
                            <Select.Option value="incomplete_docs">Incomplete Documents</Select.Option>
                            <Select.Option value="policy_violation">Policy Violation</Select.Option>
                            <Select.Option value="other">Other</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ParkingRequestsPage;
