import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Spin, Empty, Table, Tag } from 'antd';
import {
    HomeOutlined,
    UserOutlined,
    TeamOutlined,
    CarOutlined,
    FileTextOutlined,
    CalendarOutlined,
    AlertOutlined,
    DollarOutlined
} from '@ant-design/icons';
import { getDashboardStats, getRecentActivities } from '../../apis/dashboard';
import { message } from 'antd';

const DashboardPage = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [activities, setActivities] = useState<any>(null);

    // Get buildingId from localStorage (from logged in user)
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const buildingId = userInfo.buildingId;

    useEffect(() => {
        if (buildingId) {
            fetchDashboardData();
        }
    }, [buildingId]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [statsData, activitiesData] = await Promise.all([
                getDashboardStats(buildingId),
                getRecentActivities(buildingId, 5)
            ]);

            setStats(statsData.data);
            setActivities(activitiesData.data);
        } catch (error: any) {
            message.error(error.message || 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Spin size="large" />
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Empty description="No data available" />
            </div>
        );
    }

    const statCards = [
        {
            title: 'Total Blocks',
            value: stats.totalBlocks,
            icon: <HomeOutlined className="text-2xl text-blue-500" />,
            color: 'bg-blue-50'
        },
        {
            title: 'Total Units',
            value: stats.totalUnits,
            icon: <HomeOutlined className="text-2xl text-green-500" />,
            color: 'bg-green-50'
        },
        {
            title: 'Owners',
            value: stats.totalOwners,
            icon: <UserOutlined className="text-2xl text-purple-500" />,
            color: 'bg-purple-50'
        },
        {
            title: 'Tenants',
            value: stats.totalTenants,
            icon: <TeamOutlined className="text-2xl text-orange-500" />,
            color: 'bg-orange-50'
        },
        {
            title: 'Employees',
            value: stats.totalEmployees,
            icon: <TeamOutlined className="text-2xl text-pink-500" />,
            color: 'bg-pink-50'
        },
        {
            title: 'Open Complaints',
            value: stats.complaintStats.open,
            icon: <AlertOutlined className="text-2xl text-red-500" />,
            color: 'bg-red-50'
        },
        {
            title: 'Parking Available',
            value: stats.parkingStats.available,
            icon: <CarOutlined className="text-2xl text-cyan-500" />,
            color: 'bg-cyan-50'
        },
        {
            title: "Today's Visitors",
            value: stats.todayVisitors,
            icon: <UserOutlined className="text-2xl text-indigo-500" />,
            color: 'bg-indigo-50'
        },
        {
            title: 'Upcoming Events',
            value: stats.upcomingEvents,
            icon: <CalendarOutlined className="text-2xl text-yellow-500" />,
            color: 'bg-yellow-50'
        },
        {
            title: 'Total Amenities',
            value: stats.totalAmenities,
            icon: <FileTextOutlined className="text-2xl text-teal-500" />,
            color: 'bg-teal-50'
        }
    ];

    const complaintColumns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
        },
        {
            title: 'Status',
            dataIndex: 'complaintStatus',
            key: 'complaintStatus',
            render: (status: string) => {
                const colors: any = {
                    open: 'blue',
                    'in-process': 'orange',
                    'on-hold': 'purple',
                    close: 'green',
                    're-open': 'red',
                    dismiss: 'gray'
                };
                return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
            }
        },
        {
            title: 'Created',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => new Date(date).toLocaleDateString()
        }
    ];

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                <p className="text-gray-500">Overview of your society management</p>
            </div>

            {/* Stats Cards */}
            <Row gutter={[16, 16]} className="mb-6">
                {statCards.map((stat, index) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={index}>
                        <Card className={`${stat.color} border-0 hover:shadow-md transition-shadow`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <Statistic
                                        title={<span className="text-gray-600 text-sm">{stat.title}</span>}
                                        value={stat.value}
                                        valueStyle={{ fontSize: '24px', fontWeight: 'bold' }}
                                    />
                                </div>
                                <div>{stat.icon}</div>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Unit Status */}
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} lg={8}>
                    <Card title="Unit Status" className="h-full">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Vacant</span>
                                <span className="font-semibold text-green-600">{stats.unitStats.vacant}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Occupied</span>
                                <span className="font-semibold text-blue-600">{stats.unitStats.occupied}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Under Maintenance</span>
                                <span className="font-semibold text-orange-600">{stats.unitStats.maintenance}</span>
                            </div>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card title="Complaint Overview" className="h-full">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Open</span>
                                <Tag color="blue">{stats.complaintStats.open}</Tag>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">In Process</span>
                                <Tag color="orange">{stats.complaintStats.inProcess}</Tag>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">On Hold</span>
                                <Tag color="purple">{stats.complaintStats.onHold}</Tag>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Closed</span>
                                <Tag color="green">{stats.complaintStats.close}</Tag>
                            </div>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card title="Parking Status" className="h-full">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Available</span>
                                <span className="font-semibold text-green-600">{stats.parkingStats.available}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Occupied</span>
                                <span className="font-semibold text-red-600">{stats.parkingStats.occupied}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Maintenance</span>
                                <span className="font-semibold text-orange-600">{stats.parkingStats.maintenance}</span>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Recent Activities */}
            {activities && (
                <Row gutter={[16, 16]}>
                    <Col xs={24}>
                        <Card title="Recent Complaints">
                            <Table
                                columns={complaintColumns}
                                dataSource={activities.recentComplaints}
                                rowKey="_id"
                                pagination={false}
                                size="small"
                            />
                        </Card>
                    </Col>
                </Row>
            )}
        </div>
    );
};

export default DashboardPage;
