import { Badge } from '@mantine/core';
import { createEhsPage } from './templates/createEhsPage';

const NearMissReportPage = createEhsPage({
  title: 'Near Miss / Unsafe Act Report',
  description: 'Encourage reporting of near misses and unsafe conditions, assign corrective actions, and track closure.',
  primaryActionLabel: 'Submit Near Miss',
  metrics: [
    { label: 'Reports this month', value: '18', status: 'info', helperText: 'Target >= 20' },
    { label: 'Closed within 48h', value: '14', status: 'success', helperText: '78% quick closure' },
    { label: 'High severity pending', value: '2', status: 'danger', helperText: 'Escalated to leadership' }
  ],
  table: {
    columns: [
      { key: 'ref', label: 'Reference' },
      { key: 'location', label: 'Location' },
      { key: 'reportedBy', label: 'Reported By' },
      { key: 'status', label: 'Status' }
    ],
    rows: [
      {
        ref: 'NM/2025/031',
        location: 'Tower B - Basement',
        reportedBy: 'K. Solanki',
        status: <Badge color="green">Closed</Badge>
      },
      {
        ref: 'NM/2025/028',
        location: 'Tower A - Façade',
        reportedBy: 'G. Jha',
        status: <Badge color="yellow">Action Pending</Badge>
      },
      {
        ref: 'NM/2025/026',
        location: 'Block C - Pump Room',
        reportedBy: 'S. Pathak',
        status: <Badge color="red">High Priority</Badge>
      }
    ],
    emptyMessage: 'No near miss reports captured yet.'
  }
});

export default NearMissReportPage;
