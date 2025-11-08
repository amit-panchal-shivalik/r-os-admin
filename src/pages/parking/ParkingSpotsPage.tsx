import { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Space, message, Tag, Row, Col } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { getParkingSpots, createParkingSpot, getParkingAreas } from '../../apis/buildingSettings';

const ParkingSpotsPage = () => {
    const [loading, setLoading] = useState(false);
    const [parkingSpots, setParkingSpots] = useState([]);
    const [parkingAreas, setParkingAreas] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    // Filter states
    const [filterArea, setFilterArea] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string | null>(null);

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const buildingId = userInfo.buildingId;

    useEffect(() => {
        if (buildingId) {
            fetchParkingAreas();
            fetchParkingSpots();
        }
    }, [buildingId]);

    useEffect(() => {
        if (buildingId) {
            fetchParkingSpots();
        }
    }, [filterArea, filterStatus]);

    const fetchParkingAreas = async () => {
        try {
            const response = await getParkingAreas(buildingId);
            setParkingAreas(response.data);
        } catch (error: any) {
            message.error('Failed to fetch parking areas');
        }
    };

    const fetchParkingSpots = async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (filterArea) params.parkingAreaId = filterArea;
            if (filterStatus) params.spotStatus = filterStatus;

            const response = await getParkingSpots(params);
            setParkingSpots(response.data);
        } catch (error: any) {
            message.error(error.message || 'Failed to fetch parking spots');
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
            await createParkingSpot(values);
            message.success('Parking spot created successfully');
            setIsModalOpen(false);
            fetchParkingSpots();
        } catch (error: any) {
            message.error(error.message || 'Failed to create parking spot');
        }
    };

    const handleClearFilters = () => {
        setFilterArea(null);
        setFilterStatus(null);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available':
                return 'green';
            case 'occupied':
                return 'blue';
            case 'reserved':
                return 'orange';
            case 'maintenance':
                return 'red';
            default:
                return 'default';
        }
    };

    const columns = [
        {
            title: 'Spot Number',
            dataIndex: 'spotNumber',
            key: 'spotNumber',
        },
        {
            title: 'Parking Area',
            dataIndex: ['parkingAreaId', 'areaName'],
            key: 'areaName',
        },
        {
            title: 'Spot Type',
            dataIndex: 'spotType',
            key: 'spotType',
            render: (type: string) => (
                <Tag color={type === 'car' ? 'blue' : type === 'bike' ? 'green' : 'orange'}>
                    {type?.toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Status',
            dataIndex: 'spotStatus',
            key: 'spotStatus',
            render: (status: string) => (
                <Tag color={getStatusColor(status)}>
                    {status?.replace('_', ' ').toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Unit Assigned',
            dataIndex: ['unitId', 'unitNumber'],
            key: 'unitNumber',
            render: (unitNumber: string) => unitNumber || '-'
        },
        {
            title: 'Member Assigned',
            dataIndex: ['memberId', 'firstName'],
            key: 'memberName',
            render: (firstName: string, record: any) => {
                if (firstName && record.memberId?.lastName) {
                    return `${firstName} ${record.memberId.lastName}`;
                }
                return '-';
            }
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => new Date(date).toLocaleDateString()
        }
    ];

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Parking Spots</h1>
                    <p className="text-gray-500">Manage individual parking spots</p>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                >
                    Add Parking Spot
                </Button>
            </div>

            {/* Filters */}
            <Card className="mb-4">
                <Row gutter={16}>
                    <Col span={8}>
                        <Select
                            placeholder="Filter by Parking Area"
                            style={{ width: '100%' }}
                            allowClear
                            value={filterArea}
                            onChange={setFilterArea}
                        >
                            {parkingAreas.map((area: any) => (
                                <Select.Option key={area._id} value={area._id}>
                                    {area.areaName}
                                </Select.Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={8}>
                        <Select
                            placeholder="Filter by Status"
                            style={{ width: '100%' }}
                            allowClear
                            value={filterStatus}
                            onChange={setFilterStatus}
                        >
                            <Select.Option value="available">Available</Select.Option>
                            <Select.Option value="occupied">Occupied</Select.Option>
                            <Select.Option value="reserved">Reserved</Select.Option>
                            <Select.Option value="maintenance">Maintenance</Select.Option>
                        </Select>
                    </Col>
                    <Col span={8}>
                        <Button onClick={handleClearFilters}>
                            Clear Filters
                        </Button>
                    </Col>
                </Row>
            </Card>

            <Card>
                <Table
                    loading={loading}
                    dataSource={parkingSpots}
                    columns={columns}
                    rowKey="_id"
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Modal
                title="Add Parking Spot"
                open={isModalOpen}
                onOk={handleSubmit}
                onCancel={() => setIsModalOpen(false)}
                okText="Save"
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Form.Item
                        name="parkingAreaId"
                        label="Parking Area"
                        rules={[{ required: true, message: 'Please select parking area' }]}
                    >
                        <Select placeholder="Select parking area">
                            {parkingAreas.map((area: any) => (
                                <Select.Option key={area._id} value={area._id}>
                                    {area.areaName}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="spotNumber"
                        label="Spot Number"
                        rules={[{ required: true, message: 'Please enter spot number' }]}
                    >
                        <Input placeholder="Enter spot number (e.g., A1, B12)" />
                    </Form.Item>
                    <Form.Item
                        name="spotType"
                        label="Spot Type"
                        rules={[{ required: true, message: 'Please select spot type' }]}
                    >
                        <Select placeholder="Select spot type">
                            <Select.Option value="car">Car</Select.Option>
                            <Select.Option value="bike">Bike</Select.Option>
                            <Select.Option value="visitor">Visitor</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="spotStatus"
                        label="Initial Status"
                        initialValue="available"
                    >
                        <Select placeholder="Select initial status">
                            <Select.Option value="available">Available</Select.Option>
                            <Select.Option value="maintenance">Maintenance</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ParkingSpotsPage;
