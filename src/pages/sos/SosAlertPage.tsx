import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Table,
  Space,
  Tag,
  message,
  Modal,
  Input,
  Select,
  Statistic,
  Row,
  Col,
  Empty,
} from 'antd';
import {
  AlertOutlined,
  SoundOutlined,
  StopOutlined,
  HistoryOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { triggerSosAlert, deactivateSosAlert, getAllSosAlerts } from '../../apis/sos';
import { getAllBuildingsApi } from '../../apis/building';

const { TextArea } = Input;

const SosAlertPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('');
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [triggerModalVisible, setTriggerModalVisible] = useState(false);

  useEffect(() => {
    fetchBuildings();
    fetchAlerts();
  }, []);

  const fetchBuildings = async () => {
    try {
      const data = await getAllBuildingsApi({});
      console.log('Buildings response:', data);
      if (data && data.success) {
        setBuildings(data.data || []);
      } else {
        setBuildings([]);
      }
    } catch (error: any) {
      console.error('Failed to fetch buildings:', error);
      setBuildings([]);
    }
  };

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await getAllSosAlerts({});
      console.log('SOS Alerts response:', data);
      if (data && data.success) {
        setAlerts(data.data || []);
      } else {
        setAlerts([]);
      }
    } catch (error: any) {
      console.error('Failed to fetch SOS alerts:', error);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerAlert = async () => {
    if (!selectedBuildingId) {
      message.error('Please select a building');
      return;
    }

    Modal.confirm({
      title: '🚨 Trigger Emergency SOS Alert',
      icon: <WarningOutlined style={{ color: '#ff4d4f' }} />,
      content: (
        <div style={{ marginTop: 16 }}>
          <p style={{ fontWeight: 600, color: '#ff4d4f' }}>
            This will trigger an emergency alarm on ALL resident devices in the selected building!
          </p>
          <p style={{ marginTop: 12 }}>
            The alarm sound will play immediately on all connected mobile devices.
          </p>
          <p style={{ marginTop: 12, fontSize: 13, color: '#666' }}>
            Only trigger this alert in case of real emergencies.
          </p>
        </div>
      ),
      okText: 'Yes, Trigger Alert',
      okButtonProps: {
        danger: true,
        icon: <SoundOutlined />,
      },
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          setLoading(true);
          const data = await triggerSosAlert({
            buildingId: selectedBuildingId,
            message: alertMessage || 'Emergency SOS Alert - Please stay safe and follow emergency protocols',
          });

          if (data && data.success) {
            message.success('🚨 SOS Alert Triggered! All residents have been notified.');
            setTriggerModalVisible(false);
            setAlertMessage('');
            fetchAlerts();
          } else {
            message.error(data?.message || 'Failed to trigger SOS alert');
          }
        } catch (error: any) {
          message.error(error.message || 'Failed to trigger SOS alert');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleDeactivateAlert = async (alertId: string) => {
    Modal.confirm({
      title: 'Deactivate SOS Alert',
      content: 'Are you sure you want to deactivate this SOS alert?',
      okText: 'Yes, Deactivate',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          setLoading(true);
          const data = await deactivateSosAlert(alertId);
          if (data && data.success) {
            message.success('SOS alert deactivated successfully');
            fetchAlerts();
          } else {
            message.error(data?.message || 'Failed to deactivate SOS alert');
          }
        } catch (error: any) {
          message.error(error.message || 'Failed to deactivate SOS alert');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const columns = [
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'red' : 'default'} icon={isActive ? <SoundOutlined /> : <StopOutlined />}>
          {isActive ? 'ACTIVE' : 'Deactivated'}
        </Tag>
      ),
    },
    {
      title: 'Building',
      dataIndex: ['buildingId', 'buildingName'],
      key: 'building',
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
    {
      title: 'Triggered By',
      dataIndex: 'triggeredBy',
      key: 'triggeredBy',
      render: (triggeredBy: any) => (
        <span>{triggeredBy?.firstName} {triggeredBy?.lastName}</span>
      ),
    },
    {
      title: 'Triggered At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Deactivated At',
      dataIndex: 'deactivatedAt',
      key: 'deactivatedAt',
      render: (date: string) => date ? new Date(date).toLocaleString() : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          {record.isActive && (
            <Button
              type="primary"
              danger
              size="small"
              icon={<StopOutlined />}
              onClick={() => handleDeactivateAlert(record._id)}
            >
              Deactivate
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const activeAlertsCount = alerts.filter(a => a.isActive).length;
  const totalAlertsCount = alerts.length;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
          🚨 Emergency SOS Alert System
        </h2>
        <p style={{ color: '#666', fontSize: 14 }}>
          Trigger emergency alerts to notify all residents in a building
        </p>
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Active Alerts"
              value={activeAlertsCount}
              prefix={<SoundOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: activeAlertsCount > 0 ? '#ff4d4f' : '#666' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Alerts (All Time)"
              value={totalAlertsCount}
              prefix={<HistoryOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card style={{ backgroundColor: '#fff1f0', borderColor: '#ffccc7' }}>
            <Button
              type="primary"
              danger
              size="large"
              block
              icon={<AlertOutlined />}
              onClick={() => setTriggerModalVisible(true)}
              style={{ height: 60, fontSize: 16, fontWeight: 600 }}
            >
              TRIGGER EMERGENCY ALERT
            </Button>
          </Card>
        </Col>
      </Row>

      <Card title={<><HistoryOutlined /> SOS Alerts History</>}>
        <Table
          columns={columns}
          dataSource={alerts}
          rowKey="_id"
          loading={loading}
          locale={{
            emptyText: (
              <Empty
                description="No SOS alerts triggered yet"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
        />
      </Card>

      <Modal
        title={<><AlertOutlined style={{ color: '#ff4d4f' }} /> Trigger Emergency SOS Alert</>}
        open={triggerModalVisible}
        onCancel={() => {
          setTriggerModalVisible(false);
          setAlertMessage('');
        }}
        footer={[
          <Button key="cancel" onClick={() => setTriggerModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="trigger"
            type="primary"
            danger
            icon={<SoundOutlined />}
            onClick={handleTriggerAlert}
            loading={loading}
          >
            Trigger Alert
          </Button>,
        ]}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <label style={{ fontWeight: 600, marginBottom: 8, display: 'block' }}>
              Select Building *
            </label>
            <Select
              style={{ width: '100%' }}
              placeholder="Select a building"
              value={selectedBuildingId}
              onChange={setSelectedBuildingId}
              options={buildings.map(b => ({
                label: b.buildingName,
                value: b._id,
              }))}
            />
          </div>

          <div>
            <label style={{ fontWeight: 600, marginBottom: 8, display: 'block' }}>
              Custom Message (Optional)
            </label>
            <TextArea
              rows={4}
              placeholder="Emergency SOS Alert - Please stay safe and follow emergency protocols"
              value={alertMessage}
              onChange={(e) => setAlertMessage(e.target.value)}
              maxLength={500}
              showCount
            />
          </div>

          <div
            style={{
              padding: 12,
              backgroundColor: '#fff7e6',
              borderLeft: '4px solid #faad14',
              borderRadius: 4,
            }}
          >
            <p style={{ margin: 0, fontSize: 13, color: '#ad6800' }}>
              ⚠️ This will immediately play an emergency alarm sound on all resident devices in the selected building.
            </p>
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default SosAlertPage;
