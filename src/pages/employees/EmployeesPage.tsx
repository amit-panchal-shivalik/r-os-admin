import { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Space, message, Popconfirm, Tag, DatePicker, Row, Col, TimePicker, Checkbox } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PhoneOutlined, IdcardOutlined } from '@ant-design/icons';
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from '../../apis/employees';
import dayjs from 'dayjs';

const EmployeesPage = () => {
    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<any>(null);
    const [employmentType, setEmploymentType] = useState<string>('society');
    const [form] = Form.useForm();

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const buildingId = userInfo.buildingId;

    useEffect(() => {
        if (buildingId) {
            fetchEmployees();
        }
    }, [buildingId]);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await getEmployees(buildingId);
            setEmployees(response.data);
        } catch (error: any) {
            message.error(error.message || 'Failed to fetch employees');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingEmployee(null);
        setEmploymentType('society');
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (record: any) => {
        setEditingEmployee(record);
        setEmploymentType(record.employmentType || 'society');
        form.setFieldsValue({
            firstName: record.firstName,
            lastName: record.lastName,
            countryCode: record.countryCode,
            phoneNumber: record.phoneNumber,
            email: record.email,
            employmentType: record.employmentType,
            role: record.role,
            employeeType: record.employeeType,
            dateOfJoining: record.dateOfJoining ? dayjs(record.dateOfJoining) : null,
            idProofType: record.idProofType,
            idProofNumber: record.idProofNumber,
            shiftStartTime: record.shiftTimings?.startTime ? dayjs(record.shiftTimings.startTime, 'HH:mm') : null,
            shiftEndTime: record.shiftTimings?.endTime ? dayjs(record.shiftTimings.endTime, 'HH:mm') : null,
            workingDays: record.workingDays,
            status: record.status,
            // Agency details
            agencyName: record.agencyDetails?.agencyName,
            agencyManagerName: record.agencyDetails?.agencyManagerName,
            contractStartDate: record.agencyDetails?.contractStartDate ? dayjs(record.agencyDetails.contractStartDate) : null,
            contractEndDate: record.agencyDetails?.contractEndDate ? dayjs(record.agencyDetails.contractEndDate) : null
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteEmployee(id);
            message.success('Employee deleted successfully');
            fetchEmployees();
        } catch (error: any) {
            message.error(error.message || 'Failed to delete employee');
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const data: any = {
                ...values,
                buildingId,
                dateOfJoining: values.dateOfJoining ? values.dateOfJoining.format('YYYY-MM-DD') : null,
                shiftTimings: {
                    startTime: values.shiftStartTime ? values.shiftStartTime.format('HH:mm') : null,
                    endTime: values.shiftEndTime ? values.shiftEndTime.format('HH:mm') : null
                }
            };

            // Remove shift fields from root
            delete data.shiftStartTime;
            delete data.shiftEndTime;

            // Handle agency details
            if (data.employmentType === 'agency') {
                data.agencyDetails = {
                    agencyName: values.agencyName,
                    agencyManagerName: values.agencyManagerName,
                    contractStartDate: values.contractStartDate ? values.contractStartDate.format('YYYY-MM-DD') : null,
                    contractEndDate: values.contractEndDate ? values.contractEndDate.format('YYYY-MM-DD') : null
                };
            }

            // Remove agency fields from root
            delete data.agencyName;
            delete data.agencyManagerName;
            delete data.contractStartDate;
            delete data.contractEndDate;

            if (editingEmployee) {
                await updateEmployee(editingEmployee._id, data);
                message.success('Employee updated successfully');
            } else {
                await createEmployee(data);
                message.success('Employee created successfully');
            }

            setIsModalOpen(false);
            fetchEmployees();
        } catch (error: any) {
            message.error(error.message || 'Failed to save employee');
        }
    };

    const columns = [
        {
            title: 'Name',
            key: 'name',
            render: (_: any, record: any) => `${record.firstName} ${record.lastName}`
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role: string) => (
                <Tag color="blue">{role?.toUpperCase()}</Tag>
            )
        },
        {
            title: 'Type',
            dataIndex: 'employeeType',
            key: 'employeeType',
        },
        {
            title: 'Employment',
            dataIndex: 'employmentType',
            key: 'employmentType',
            render: (type: string) => (
                <Tag color={type === 'society' ? 'green' : 'orange'}>
                    {type?.toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Contact',
            key: 'contact',
            render: (_: any, record: any) => (
                <div>
                    <PhoneOutlined /> {record.countryCode} {record.phoneNumber}
                </div>
            )
        },
        {
            title: 'Shift Timing',
            key: 'shift',
            render: (_: any, record: any) => {
                if (record.shiftTimings?.startTime && record.shiftTimings?.endTime) {
                    return `${record.shiftTimings.startTime} - ${record.shiftTimings.endTime}`;
                }
                return '-';
            }
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
                        title="Are you sure to delete this employee?"
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
                    <h1 className="text-2xl font-bold text-gray-800">Employees</h1>
                    <p className="text-gray-500">Manage building employees and staff</p>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                >
                    Add Employee
                </Button>
            </div>

            <Card>
                <Table
                    loading={loading}
                    dataSource={employees}
                    columns={columns}
                    rowKey="_id"
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 1200 }}
                />
            </Card>

            <Modal
                title={editingEmployee ? 'Edit Employee' : 'Add Employee'}
                open={isModalOpen}
                onOk={handleSubmit}
                onCancel={() => setIsModalOpen(false)}
                okText="Save"
                width={900}
            >
                <Form
                    form={form}
                    layout="vertical"
                    className="mt-4"
                    onValuesChange={(changedValues) => {
                        if (changedValues.employmentType) {
                            setEmploymentType(changedValues.employmentType);
                        }
                    }}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="firstName"
                                label="First Name"
                                rules={[{ required: true, message: 'Please enter first name' }]}
                            >
                                <Input placeholder="Enter first name" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="lastName"
                                label="Last Name"
                                rules={[{ required: true, message: 'Please enter last name' }]}
                            >
                                <Input placeholder="Enter last name" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="countryCode"
                                label="Country Code"
                                initialValue="+91"
                            >
                                <Input placeholder="+91" />
                            </Form.Item>
                        </Col>
                        <Col span={16}>
                            <Form.Item
                                name="phoneNumber"
                                label="Phone Number"
                                rules={[{ required: true, message: 'Please enter phone number' }]}
                            >
                                <Input placeholder="Enter phone number" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[{ type: 'email', message: 'Please enter valid email' }]}
                    >
                        <Input placeholder="Enter email address (optional)" />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="employmentType"
                                label="Employment Type"
                                rules={[{ required: true, message: 'Please select employment type' }]}
                                initialValue="society"
                            >
                                <Select placeholder="Select employment type">
                                    <Select.Option value="society">Society</Select.Option>
                                    <Select.Option value="agency">Agency</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="role"
                                label="Role"
                                rules={[{ required: true, message: 'Please enter role' }]}
                            >
                                <Input placeholder="Enter role (e.g., Security Guard)" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="employeeType"
                                label="Employee Type"
                                rules={[{ required: true, message: 'Please select employee type' }]}
                            >
                                <Select placeholder="Select employee type">
                                    <Select.Option value="full_time">Full Time</Select.Option>
                                    <Select.Option value="part_time">Part Time</Select.Option>
                                    <Select.Option value="contract">Contract</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="dateOfJoining"
                                label="Date of Joining"
                                rules={[{ required: true, message: 'Please select date' }]}
                            >
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    {employmentType === 'agency' && (
                        <>
                            <h3 className="text-lg font-semibold mb-4 mt-4">Agency Details</h3>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="agencyName"
                                        label="Agency Name"
                                        rules={[{ required: employmentType === 'agency', message: 'Please enter agency name' }]}
                                    >
                                        <Input placeholder="Enter agency name" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="agencyManagerName"
                                        label="Agency Manager"
                                    >
                                        <Input placeholder="Enter manager name" />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="contractStartDate"
                                        label="Contract Start Date"
                                    >
                                        <DatePicker style={{ width: '100%' }} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="contractEndDate"
                                        label="Contract End Date"
                                    >
                                        <DatePicker style={{ width: '100%' }} />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </>
                    )}

                    <h3 className="text-lg font-semibold mb-4 mt-4">Additional Details</h3>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="idProofType"
                                label="ID Proof Type"
                            >
                                <Select placeholder="Select ID proof type">
                                    <Select.Option value="aadhar">Aadhar Card</Select.Option>
                                    <Select.Option value="pan">PAN Card</Select.Option>
                                    <Select.Option value="driving_license">Driving License</Select.Option>
                                    <Select.Option value="voter_id">Voter ID</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="idProofNumber"
                                label="ID Proof Number"
                            >
                                <Input placeholder="Enter ID proof number" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="shiftStartTime"
                                label="Shift Start Time"
                            >
                                <TimePicker style={{ width: '100%' }} format="HH:mm" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="shiftEndTime"
                                label="Shift End Time"
                            >
                                <TimePicker style={{ width: '100%' }} format="HH:mm" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item
                        name="workingDays"
                        label="Working Days"
                    >
                        <Checkbox.Group>
                            <Row>
                                <Col span={8}><Checkbox value="monday">Monday</Checkbox></Col>
                                <Col span={8}><Checkbox value="tuesday">Tuesday</Checkbox></Col>
                                <Col span={8}><Checkbox value="wednesday">Wednesday</Checkbox></Col>
                                <Col span={8}><Checkbox value="thursday">Thursday</Checkbox></Col>
                                <Col span={8}><Checkbox value="friday">Friday</Checkbox></Col>
                                <Col span={8}><Checkbox value="saturday">Saturday</Checkbox></Col>
                                <Col span={8}><Checkbox value="sunday">Sunday</Checkbox></Col>
                            </Row>
                        </Checkbox.Group>
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

export default EmployeesPage;
