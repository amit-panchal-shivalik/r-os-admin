import { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Space, message, Tag, DatePicker, InputNumber, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DollarOutlined } from '@ant-design/icons';
import { getMaintenanceBills, createMaintenanceBill, updateMaintenanceBill, deleteMaintenanceBill, publishMaintenanceBill, getMaintenanceTypes } from '../../apis/maintenance';
import { getBlocks } from '../../apis/buildingSettings';
import dayjs from 'dayjs';

const MaintenanceBillsPage = () => {
    const [loading, setLoading] = useState(false);
    const [bills, setBills] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const [maintenanceTypes, setMaintenanceTypes] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBill, setEditingBill] = useState<any>(null);
    const [form] = Form.useForm();

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const buildingId = userInfo.buildingId;

    useEffect(() => {
        if (buildingId) {
            fetchBlocks();
            fetchMaintenanceTypes();
            fetchBills();
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

    const fetchMaintenanceTypes = async () => {
        try {
            const response = await getMaintenanceTypes(buildingId);
            setMaintenanceTypes(response.data);
        } catch (error: any) {
            message.error('Failed to fetch maintenance types');
        }
    };

    const fetchBills = async () => {
        try {
            setLoading(true);
            const response = await getMaintenanceBills(buildingId);
            setBills(response.data);
        } catch (error: any) {
            message.error(error.message || 'Failed to fetch bills');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingBill(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (record: any) => {
        setEditingBill(record);
        form.setFieldsValue({
            billMonth: record.billMonth,
            billYear: record.billYear,
            maintenanceTypeId: record.maintenanceTypeId?._id,
            dueDate: record.dueDate ? dayjs(record.dueDate) : null,
            amount: record.amount,
            blockIds: record.blockIds?.map((block: any) => block._id),
            latePaymentPenalty: record.latePaymentPenalty,
            notes: record.notes
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteMaintenanceBill(id);
            message.success('Bill deleted successfully');
            fetchBills();
        } catch (error: any) {
            message.error(error.message || 'Failed to delete bill');
        }
    };

    const handlePublish = async (id: string, currentStatus: string) => {
        try {
            const newStatus = currentStatus === 'published' ? 'draft' : 'published';
            await publishMaintenanceBill(id, newStatus);
            message.success(`Bill ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`);
            fetchBills();
        } catch (error: any) {
            message.error(error.message || 'Failed to update bill status');
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const data = {
                ...values,
                buildingId,
                dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : null
            };

            if (editingBill) {
                await updateMaintenanceBill(editingBill._id, data);
                message.success('Bill updated successfully');
            } else {
                await createMaintenanceBill(data);
                message.success('Bill created successfully');
            }

            setIsModalOpen(false);
            fetchBills();
        } catch (error: any) {
            message.error(error.message || 'Failed to save bill');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft':
                return 'orange';
            case 'published':
                return 'blue';
            case 'paid':
                return 'green';
            case 'overdue':
                return 'red';
            default:
                return 'default';
        }
    };

    const columns = [
        {
            title: 'Bill Period',
            key: 'period',
            render: (_: any, record: any) => `${record.billMonth} ${record.billYear}`
        },
        {
            title: 'Type',
            dataIndex: ['maintenanceTypeId', 'typeName'],
            key: 'typeName',
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount: number) => `₹${amount?.toLocaleString()}`
        },
        {
            title: 'Due Date',
            dataIndex: 'dueDate',
            key: 'dueDate',
            render: (date: string) => new Date(date).toLocaleDateString()
        },
        {
            title: 'Blocks',
            dataIndex: 'blockIds',
            key: 'blockIds',
            render: (blockIds: any[]) => {
                if (!blockIds || blockIds.length === 0) return <Tag>All Blocks</Tag>;
                return (
                    <Space wrap>
                        {blockIds.map((block: any) => (
                            <Tag key={block._id}>{block.blockName}</Tag>
                        ))}
                    </Space>
                );
            }
        },
        {
            title: 'Late Penalty',
            dataIndex: 'latePaymentPenalty',
            key: 'latePaymentPenalty',
            render: (penalty: number) => penalty ? `₹${penalty}` : '-'
        },
        {
            title: 'Status',
            dataIndex: 'billStatus',
            key: 'billStatus',
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
            width: 280,
            render: (_: any, record: any) => (
                <Space>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => handlePublish(record._id, record.billStatus)}
                    >
                        {record.billStatus === 'published' ? 'Unpublish' : 'Publish'}
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
                    <h1 className="text-2xl font-bold text-gray-800">Maintenance Bills</h1>
                    <p className="text-gray-500">Manage monthly maintenance bills</p>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                >
                    Create Bill
                </Button>
            </div>

            <Card>
                <Table
                    loading={loading}
                    dataSource={bills}
                    columns={columns}
                    rowKey="_id"
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 1400 }}
                />
            </Card>

            <Modal
                title={editingBill ? 'Edit Maintenance Bill' : 'Create Maintenance Bill'}
                open={isModalOpen}
                onOk={handleSubmit}
                onCancel={() => setIsModalOpen(false)}
                okText="Save"
                width={700}
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="billMonth"
                                label="Bill Month"
                                rules={[{ required: true, message: 'Please select month' }]}
                            >
                                <Select placeholder="Select month">
                                    <Select.Option value="January">January</Select.Option>
                                    <Select.Option value="February">February</Select.Option>
                                    <Select.Option value="March">March</Select.Option>
                                    <Select.Option value="April">April</Select.Option>
                                    <Select.Option value="May">May</Select.Option>
                                    <Select.Option value="June">June</Select.Option>
                                    <Select.Option value="July">July</Select.Option>
                                    <Select.Option value="August">August</Select.Option>
                                    <Select.Option value="September">September</Select.Option>
                                    <Select.Option value="October">October</Select.Option>
                                    <Select.Option value="November">November</Select.Option>
                                    <Select.Option value="December">December</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="billYear"
                                label="Bill Year"
                                rules={[{ required: true, message: 'Please enter year' }]}
                                initialValue={new Date().getFullYear()}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={2020}
                                    max={2050}
                                    placeholder="Enter year"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item
                        name="maintenanceTypeId"
                        label="Maintenance Type"
                        rules={[{ required: true, message: 'Please select maintenance type' }]}
                    >
                        <Select placeholder="Select maintenance type">
                            {maintenanceTypes.map((type: any) => (
                                <Select.Option key={type._id} value={type._id}>
                                    {type.typeName}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="amount"
                                label="Amount (₹)"
                                rules={[{ required: true, message: 'Please enter amount' }]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    placeholder="Enter amount"
                                    prefix={<DollarOutlined />}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="dueDate"
                                label="Due Date"
                                rules={[{ required: true, message: 'Please select due date' }]}
                            >
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>
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
                        name="latePaymentPenalty"
                        label="Late Payment Penalty (₹)"
                        initialValue={0}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            placeholder="Enter penalty amount"
                        />
                    </Form.Item>
                    <Form.Item
                        name="notes"
                        label="Notes"
                    >
                        <Input.TextArea
                            rows={3}
                            placeholder="Enter any additional notes"
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default MaintenanceBillsPage;
