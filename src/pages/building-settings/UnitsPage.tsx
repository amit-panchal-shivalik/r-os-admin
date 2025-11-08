import { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Space, message, Popconfirm, InputNumber, Tag, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FilterOutlined } from '@ant-design/icons';
import { getUnits, createUnit, updateUnit, deleteUnit, getBlocks, getFloors } from '../../apis/buildingSettings';

const UnitsPage = () => {
    const [loading, setLoading] = useState(false);
    const [units, setUnits] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const [floors, setFloors] = useState([]);
    const [allFloors, setAllFloors] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState<any>(null);
    const [form] = Form.useForm();
    const [selectedBlockForForm, setSelectedBlockForForm] = useState<string | null>(null);

    // Filter states
    const [filterBlock, setFilterBlock] = useState<string | null>(null);
    const [filterFloor, setFilterFloor] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string | null>(null);
    const [filterFloorsForFilter, setFilterFloorsForFilter] = useState([]);

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const buildingId = userInfo.buildingId;

    useEffect(() => {
        if (buildingId) {
            fetchBlocks();
            fetchAllFloors();
            fetchUnits();
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

    const fetchAllFloors = async () => {
        try {
            const response = await getFloors();
            setAllFloors(response.data);
        } catch (error: any) {
            message.error('Failed to fetch floors');
        }
    };

    const fetchUnits = async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (filterBlock) params.blockId = filterBlock;
            if (filterFloor) params.floorId = filterFloor;
            if (filterStatus) params.unitStatus = filterStatus;

            const response = await getUnits(params);
            setUnits(response.data);
        } catch (error: any) {
            message.error(error.message || 'Failed to fetch units');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (buildingId) {
            fetchUnits();
        }
    }, [filterBlock, filterFloor, filterStatus]);

    const handleAdd = () => {
        setEditingUnit(null);
        form.resetFields();
        setSelectedBlockForForm(null);
        setFloors([]);
        setIsModalOpen(true);
    };

    const handleEdit = (record: any) => {
        setEditingUnit(record);
        const blockId = record.floorId?.blockId?._id || record.blockId?._id;
        setSelectedBlockForForm(blockId);

        // Load floors for this block
        if (blockId) {
            const blockFloors = allFloors.filter((floor: any) => floor.blockId?._id === blockId);
            setFloors(blockFloors);
        }

        form.setFieldsValue({
            blockId: blockId,
            floorId: record.floorId?._id,
            unitNumber: record.unitNumber,
            unitType: record.unitType,
            area: record.area,
            unitStatus: record.unitStatus
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteUnit(id);
            message.success('Unit deleted successfully');
            fetchUnits();
        } catch (error: any) {
            message.error(error.message || 'Failed to delete unit');
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const { blockId, ...unitData } = values;

            if (editingUnit) {
                await updateUnit(editingUnit._id, unitData);
                message.success('Unit updated successfully');
            } else {
                await createUnit(unitData);
                message.success('Unit created successfully');
            }

            setIsModalOpen(false);
            fetchUnits();
        } catch (error: any) {
            message.error(error.message || 'Failed to save unit');
        }
    };

    const handleBlockChange = (blockId: string) => {
        setSelectedBlockForForm(blockId);
        form.setFieldValue('floorId', null);

        // Filter floors based on selected block
        const blockFloors = allFloors.filter((floor: any) => floor.blockId?._id === blockId);
        setFloors(blockFloors);
    };

    const handleFilterBlockChange = (blockId: string) => {
        setFilterBlock(blockId);
        setFilterFloor(null);

        // Filter floors for the filter dropdown
        const blockFloors = allFloors.filter((floor: any) => floor.blockId?._id === blockId);
        setFilterFloorsForFilter(blockFloors);
    };

    const handleClearFilters = () => {
        setFilterBlock(null);
        setFilterFloor(null);
        setFilterStatus(null);
        setFilterFloorsForFilter([]);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'vacant':
                return 'green';
            case 'occupied':
                return 'blue';
            case 'under_maintenance':
                return 'orange';
            default:
                return 'default';
        }
    };

    const columns = [
        {
            title: 'Unit Number',
            dataIndex: 'unitNumber',
            key: 'unitNumber',
        },
        {
            title: 'Unit Type',
            dataIndex: 'unitType',
            key: 'unitType',
        },
        {
            title: 'Area (sq.ft)',
            dataIndex: 'area',
            key: 'area',
            render: (area: number) => `${area} sq.ft`
        },
        {
            title: 'Floor',
            dataIndex: ['floorId', 'floorName'],
            key: 'floorName',
        },
        {
            title: 'Block',
            dataIndex: ['floorId', 'blockId', 'blockName'],
            key: 'blockName',
        },
        {
            title: 'Status',
            dataIndex: 'unitStatus',
            key: 'unitStatus',
            render: (status: string) => (
                <Tag color={getStatusColor(status)}>
                    {status?.replace('_', ' ').toUpperCase()}
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
                        title="Are you sure to delete this unit?"
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
                    <h1 className="text-2xl font-bold text-gray-800">Units</h1>
                    <p className="text-gray-500">Manage building units</p>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                >
                    Add Unit
                </Button>
            </div>

            {/* Filters */}
            <Card className="mb-4">
                <Row gutter={16}>
                    <Col span={6}>
                        <Select
                            placeholder="Filter by Block"
                            style={{ width: '100%' }}
                            allowClear
                            value={filterBlock}
                            onChange={handleFilterBlockChange}
                        >
                            {blocks.map((block: any) => (
                                <Select.Option key={block._id} value={block._id}>
                                    {block.blockName}
                                </Select.Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={6}>
                        <Select
                            placeholder="Filter by Floor"
                            style={{ width: '100%' }}
                            allowClear
                            value={filterFloor}
                            onChange={setFilterFloor}
                            disabled={!filterBlock}
                        >
                            {filterFloorsForFilter.map((floor: any) => (
                                <Select.Option key={floor._id} value={floor._id}>
                                    {floor.floorName}
                                </Select.Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={6}>
                        <Select
                            placeholder="Filter by Status"
                            style={{ width: '100%' }}
                            allowClear
                            value={filterStatus}
                            onChange={setFilterStatus}
                        >
                            <Select.Option value="vacant">Vacant</Select.Option>
                            <Select.Option value="occupied">Occupied</Select.Option>
                            <Select.Option value="under_maintenance">Under Maintenance</Select.Option>
                        </Select>
                    </Col>
                    <Col span={6}>
                        <Button
                            icon={<FilterOutlined />}
                            onClick={handleClearFilters}
                        >
                            Clear Filters
                        </Button>
                    </Col>
                </Row>
            </Card>

            <Card>
                <Table
                    loading={loading}
                    dataSource={units}
                    columns={columns}
                    rowKey="_id"
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Modal
                title={editingUnit ? 'Edit Unit' : 'Add Unit'}
                open={isModalOpen}
                onOk={handleSubmit}
                onCancel={() => setIsModalOpen(false)}
                okText="Save"
                width={600}
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="blockId"
                                label="Block"
                                rules={[{ required: true, message: 'Please select block' }]}
                            >
                                <Select
                                    placeholder="Select block"
                                    onChange={handleBlockChange}
                                >
                                    {blocks.map((block: any) => (
                                        <Select.Option key={block._id} value={block._id}>
                                            {block.blockName}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="floorId"
                                label="Floor"
                                rules={[{ required: true, message: 'Please select floor' }]}
                            >
                                <Select
                                    placeholder="Select floor"
                                    disabled={!selectedBlockForForm}
                                >
                                    {floors.map((floor: any) => (
                                        <Select.Option key={floor._id} value={floor._id}>
                                            {floor.floorName}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="unitNumber"
                                label="Unit Number"
                                rules={[{ required: true, message: 'Please enter unit number' }]}
                            >
                                <Input placeholder="Enter unit number (e.g., 101)" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="unitType"
                                label="Unit Type"
                                rules={[{ required: true, message: 'Please select unit type' }]}
                            >
                                <Select placeholder="Select unit type">
                                    <Select.Option value="1BHK">1BHK</Select.Option>
                                    <Select.Option value="2BHK">2BHK</Select.Option>
                                    <Select.Option value="3BHK">3BHK</Select.Option>
                                    <Select.Option value="4BHK">4BHK</Select.Option>
                                    <Select.Option value="Penthouse">Penthouse</Select.Option>
                                    <Select.Option value="Studio">Studio</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="area"
                                label="Area (sq.ft)"
                                rules={[{ required: true, message: 'Please enter area' }]}
                            >
                                <InputNumber
                                    min={100}
                                    max={10000}
                                    placeholder="Enter area"
                                    style={{ width: '100%' }}
                                    addonAfter="sq.ft"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="unitStatus"
                                label="Unit Status"
                                initialValue="vacant"
                            >
                                <Select placeholder="Select status">
                                    <Select.Option value="vacant">Vacant</Select.Option>
                                    <Select.Option value="occupied">Occupied</Select.Option>
                                    <Select.Option value="under_maintenance">Under Maintenance</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </div>
    );
};

export default UnitsPage;
