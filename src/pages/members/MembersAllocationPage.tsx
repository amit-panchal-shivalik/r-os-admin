import { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Select, Space, message, Tag, Row, Col, Alert } from 'antd';
import { PlusOutlined, UserAddOutlined, HomeOutlined } from '@ant-design/icons';
import { getAllMembersApi, getAllUsersApi, createOrUpdateMemberApi } from '../../apis/members';
import apiClient from '../../apis/apiService';

const MembersAllocationPage = () => {
    const [loading, setLoading] = useState(false);
    const [members, setMembers] = useState([]);
    const [users, setUsers] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const [floors, setFloors] = useState([]);
    const [units, setUnits] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const buildingId = userInfo.buildingId;

    useEffect(() => {
        if (buildingId) {
            fetchMembers();
            fetchUsers();
            fetchBlocks();
        }
    }, [buildingId]);

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const response = await getAllMembersApi(buildingId, {});
            setMembers(response.data.members || []);
        } catch (error: any) {
            message.error(error.message || 'Failed to fetch members');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await getAllUsersApi();
            setUsers(response.data || []);
        } catch (error: any) {
            message.error(error.message || 'Failed to fetch users');
        }
    };

    const fetchBlocks = async () => {
        try {
            const response = await apiClient.get(`/building-settings/blocks?buildingId=${buildingId}`);
            setBlocks(response.data.data || []);
        } catch (error: any) {
            message.error(error.message || 'Failed to fetch blocks');
        }
    };

    const fetchFloors = async (blockId: string) => {
        try {
            const response = await apiClient.get(`/building-settings/floors?blockId=${blockId}`);
            setFloors(response.data.data || []);
        } catch (error: any) {
            message.error(error.message || 'Failed to fetch floors');
        }
    };

    const fetchUnits = async (floorId: string) => {
        try {
            const response = await apiClient.get(`/building-settings/units?floorId=${floorId}`);
            setUnits(response.data.data || []);
        } catch (error: any) {
            message.error(error.message || 'Failed to fetch units');
        }
    };

    const handleBlockChange = async (blockId: string) => {
        form.setFieldsValue({ floorId: undefined, unitId: undefined });
        setFloors([]);
        setUnits([]);
        if (blockId) {
            await fetchFloors(blockId);
        }
    };

    const handleFloorChange = async (floorId: string) => {
        form.setFieldsValue({ unitId: undefined });
        setUnits([]);
        if (floorId) {
            await fetchUnits(floorId);
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
                ...values,
                buildingId,
            };

            await createOrUpdateMemberApi(data);
            message.success('Unit allocated successfully! Member has been pre-approved.');

            setIsModalOpen(false);
            fetchMembers();
        } catch (error: any) {
            message.error(error.message || 'Failed to allocate unit');
        }
    };

    const columns = [
        {
            title: 'Name',
            key: 'name',
            render: (_: any, record: any) => `${record.firstName} ${record.lastName}`
        },
        {
            title: 'Contact',
            key: 'contact',
            render: (_: any, record: any) => (
                <div>
                    <div>{record.phoneNumber}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>{record.email}</div>
                </div>
            )
        },
        {
            title: 'Unit',
            key: 'unit',
            render: (_: any, record: any) => (
                <div>
                    <HomeOutlined /> {record.unitId?.unitNumber || '-'}
                    <div style={{ fontSize: '12px', color: '#888' }}>
                        {record.blockId?.blockName}, Floor {record.floorId?.floorName}
                    </div>
                </div>
            )
        },
        {
            title: 'Member Type',
            dataIndex: 'memberType',
            key: 'memberType',
            render: (type: string) => (
                <Tag color={type === 'Owner' ? 'blue' : type === 'Tenant' ? 'orange' : 'default'}>
                    {type}
                </Tag>
            )
        },
        {
            title: 'Committee Role',
            dataIndex: 'committeeType',
            key: 'committeeType',
            render: (type: string) => type ? (
                <Tag color="purple">{type}</Tag>
            ) : '-'
        },
        {
            title: 'Status',
            dataIndex: 'memberStatus',
            key: 'memberStatus',
            render: (status: string) => (
                <Tag color={status === 'approved' ? 'green' : status === 'pending' ? 'orange' : 'red'}>
                    {status?.toUpperCase()}
                </Tag>
            )
        }
    ];

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Members & Unit Allocation</h1>
                    <p className="text-gray-500">Allocate units to users and manage building members</p>
                </div>
                <Button
                    type="primary"
                    icon={<UserAddOutlined />}
                    onClick={handleAdd}
                >
                    Allocate Unit
                </Button>
            </div>

            <Alert
                message="Automatic Member Approval"
                description="When you allocate a unit to a user (including committee members), a member record is automatically created with 'approved' status. Committee members can login to the app immediately after allocation."
                type="info"
                showIcon
                className="mb-4"
            />

            <Card>
                <Table
                    loading={loading}
                    dataSource={members}
                    columns={columns}
                    rowKey="_id"
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Modal
                title="Allocate Unit to User"
                open={isModalOpen}
                onOk={handleSubmit}
                onCancel={() => setIsModalOpen(false)}
                okText="Allocate"
                width={600}
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Alert
                        message="This will create a pre-approved member record"
                        type="info"
                        showIcon
                        className="mb-4"
                    />

                    <Form.Item
                        name="userId"
                        label="Select User"
                        rules={[{ required: true, message: 'Please select a user' }]}
                    >
                        <Select
                            placeholder="Select user to assign unit"
                            showSearch
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={users.map((user: any) => ({
                                value: user._id,
                                label: `${user.firstName} ${user.lastName} (${user.phoneNumber})${user.isbuildingMember ? ' - Committee Member' : ''}`
                            }))}
                        />
                    </Form.Item>

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
                                    options={blocks.map((block: any) => ({
                                        value: block._id,
                                        label: block.blockName
                                    }))}
                                />
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
                                    onChange={handleFloorChange}
                                    disabled={floors.length === 0}
                                    options={floors.map((floor: any) => ({
                                        value: floor._id,
                                        label: floor.floorName
                                    }))}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="unitId"
                        label="Unit"
                        rules={[{ required: true, message: 'Please select unit' }]}
                    >
                        <Select
                            placeholder="Select unit"
                            disabled={units.length === 0}
                            options={units.map((unit: any) => ({
                                value: unit._id,
                                label: `${unit.unitNumber} (${unit.unitType})`
                            }))}
                        />
                    </Form.Item>

                    <Form.Item
                        name="memberType"
                        label="Member Type"
                        rules={[{ required: true, message: 'Please select member type' }]}
                        initialValue="Owner"
                    >
                        <Select placeholder="Select member type">
                            <Select.Option value="Owner">Owner</Select.Option>
                            <Select.Option value="Tenant">Tenant</Select.Option>
                            <Select.Option value="Family Member">Family Member</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="gender"
                        label="Gender"
                        initialValue="Other"
                    >
                        <Select placeholder="Select gender">
                            <Select.Option value="Male">Male</Select.Option>
                            <Select.Option value="Female">Female</Select.Option>
                            <Select.Option value="Other">Other</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default MembersAllocationPage;
