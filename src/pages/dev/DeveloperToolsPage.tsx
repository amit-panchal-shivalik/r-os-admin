import { useState, useEffect } from 'react';
import { Card, Button, Descriptions, Statistic, Row, Col, Modal, message, Alert, Spin } from 'antd';
import { DeleteOutlined, ReloadOutlined, WarningOutlined, DatabaseOutlined } from '@ant-design/icons';
import { getDatabaseStats, cleanDatabase } from '../../apis/dev';

export const DeveloperToolsPage = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [cleanLoading, setCleanLoading] = useState(false);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await getDatabaseStats();
            setStats(response.data);
        } catch (error: any) {
            message.error(error.message || 'Failed to fetch database statistics');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleCleanDatabase = () => {
        Modal.confirm({
            title: '⚠️ DANGER: Clean Entire Database?',
            icon: <WarningOutlined style={{ color: 'red' }} />,
            content: (
                <div>
                    <Alert
                        message="This action is IRREVERSIBLE!"
                        description="All data including users, buildings, members, notices, events, and everything else will be permanently deleted. This cannot be undone."
                        type="error"
                        showIcon
                        style={{ marginTop: 16, marginBottom: 16 }}
                    />
                    <p><strong>Total records to be deleted: {stats?.totalRecords || 0}</strong></p>
                    <p>Are you absolutely sure you want to proceed?</p>
                </div>
            ),
            okText: 'Yes, Delete Everything',
            okType: 'danger',
            cancelText: 'Cancel',
            width: 600,
            onOk: async () => {
                try {
                    setCleanLoading(true);
                    const response = await cleanDatabase();
                    message.success(response.message || 'Database cleaned successfully');
                    
                    // Show deletion summary
                    Modal.info({
                        title: 'Database Cleanup Complete',
                        content: (
                            <div>
                                <p><strong>Total records deleted: {response.data.totalRecordsDeleted}</strong></p>
                                <Descriptions column={2} size="small" bordered>
                                    <Descriptions.Item label="Users">{response.data.deletedCounts.users}</Descriptions.Item>
                                    <Descriptions.Item label="Members">{response.data.deletedCounts.members}</Descriptions.Item>
                                    <Descriptions.Item label="Buildings">{response.data.deletedCounts.buildings}</Descriptions.Item>
                                    <Descriptions.Item label="Blocks">{response.data.deletedCounts.blocks}</Descriptions.Item>
                                    <Descriptions.Item label="Floors">{response.data.deletedCounts.floors}</Descriptions.Item>
                                    <Descriptions.Item label="Units">{response.data.deletedCounts.units}</Descriptions.Item>
                                    <Descriptions.Item label="Notices">{response.data.deletedCounts.notices}</Descriptions.Item>
                                    <Descriptions.Item label="Events">{response.data.deletedCounts.events}</Descriptions.Item>
                                    <Descriptions.Item label="Complaints">{response.data.deletedCounts.complaints}</Descriptions.Item>
                                    <Descriptions.Item label="Amenities">{response.data.deletedCounts.amenities}</Descriptions.Item>
                                </Descriptions>
                            </div>
                        ),
                    });
                    
                    // Refresh stats
                    fetchStats();
                } catch (error: any) {
                    message.error(error.message || 'Failed to clean database');
                } finally {
                    setCleanLoading(false);
                }
            },
        });
    };

    if (loading && !stats) {
        return (
            <div style={{ textAlign: 'center', padding: 50 }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div>
            <Alert
                message="⚠️ Development Mode Only"
                description="These tools are only available in development environment. They will not work in production."
                type="warning"
                showIcon
                style={{ marginBottom: 24 }}
            />

            <Card
                title={
                    <span>
                        <DatabaseOutlined style={{ marginRight: 8 }} />
                        Database Statistics
                    </span>
                }
                extra={
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={fetchStats}
                        loading={loading}
                    >
                        Refresh
                    </Button>
                }
                style={{ marginBottom: 24 }}
            >
                {stats && (
                    <>
                        <Row gutter={16} style={{ marginBottom: 24 }}>
                            <Col span={8}>
                                <Statistic
                                    title="Total Records"
                                    value={stats.totalRecords}
                                    prefix={<DatabaseOutlined />}
                                />
                            </Col>
                            <Col span={8}>
                                <Statistic
                                    title="Buildings"
                                    value={stats.collections.buildings}
                                />
                            </Col>
                            <Col span={8}>
                                <Statistic
                                    title="Total Users"
                                    value={stats.collections.users}
                                />
                            </Col>
                        </Row>

                        <Descriptions bordered column={3} size="small">
                            <Descriptions.Item label="Members (Total)">
                                {stats.collections.members}
                            </Descriptions.Item>
                            <Descriptions.Item label="Pending Approvals">
                                {stats.collections.membersPending}
                            </Descriptions.Item>
                            <Descriptions.Item label="Approved Members">
                                {stats.collections.membersApproved}
                            </Descriptions.Item>
                            
                            <Descriptions.Item label="Blocks">
                                {stats.collections.blocks}
                            </Descriptions.Item>
                            <Descriptions.Item label="Floors">
                                {stats.collections.floors}
                            </Descriptions.Item>
                            <Descriptions.Item label="Units">
                                {stats.collections.units}
                            </Descriptions.Item>
                            
                            <Descriptions.Item label="Notices">
                                {stats.collections.notices}
                            </Descriptions.Item>
                            <Descriptions.Item label="Events">
                                {stats.collections.events}
                            </Descriptions.Item>
                            <Descriptions.Item label="Complaints">
                                {stats.collections.complaints}
                            </Descriptions.Item>
                            
                            <Descriptions.Item label="Amenities">
                                {stats.collections.amenities}
                            </Descriptions.Item>
                            <Descriptions.Item label="Committee Members">
                                {stats.collections.committeeMembers}
                            </Descriptions.Item>
                            <Descriptions.Item label="Employees">
                                {stats.collections.employees}
                            </Descriptions.Item>
                            
                            <Descriptions.Item label="Parking">
                                {stats.collections.parking}
                            </Descriptions.Item>
                            <Descriptions.Item label="Visitors">
                                {stats.collections.visitors}
                            </Descriptions.Item>
                            <Descriptions.Item label="Maintenance Bills">
                                {stats.collections.maintenanceBills}
                            </Descriptions.Item>
                        </Descriptions>

                        <div style={{ marginTop: 16, fontSize: 12, color: '#666' }}>
                            Last updated: {new Date(stats.timestamp).toLocaleString()}
                        </div>
                    </>
                )}
            </Card>

            <Card
                title={
                    <span style={{ color: 'red' }}>
                        <WarningOutlined style={{ marginRight: 8 }} />
                        Danger Zone
                    </span>
                }
            >
                <Alert
                    message="Clean Database"
                    description="This will permanently delete ALL data from the database. Use this only for testing and development purposes. This action cannot be undone."
                    type="error"
                    showIcon
                    style={{ marginBottom: 16 }}
                />
                
                <Button
                    type="primary"
                    danger
                    size="large"
                    icon={<DeleteOutlined />}
                    onClick={handleCleanDatabase}
                    loading={cleanLoading}
                    disabled={!stats || stats.totalRecords === 0}
                >
                    Clean Entire Database ({stats?.totalRecords || 0} records)
                </Button>
            </Card>
        </div>
    );
};
