import { Badge } from '@mantine/core';
import { createEhsPage } from './templates/createEhsPage';

const WorkPermitPage = createEhsPage({
  title: 'Work Permit (Confined Space & Hot Work)',
  description: 'Manage issuance, monitoring, and close-out of confined space, hot work, and high-risk work permits.',
  primaryActionLabel: 'Issue Work Permit',
  metrics: [
    { label: 'Permits issued today', value: '7', status: 'info', helperText: 'Across all shifts' },
    { label: 'Active permits', value: '12', status: 'warning', helperText: 'Ensure periodic monitoring' },
    { label: 'Permits overdue for closure', value: '1', status: 'danger', helperText: 'Immediate closure required' }
  ],
  table: {
    columns: [
      { key: 'permitNo', label: 'Permit No.' },
      { key: 'type', label: 'Permit Type' },
      { key: 'validTill', label: 'Valid Till' },
      { key: 'status', label: 'Status' }
    ],
    rows: [
      {
        permitNo: 'WP/2025/118',
        type: 'Hot Work',
        validTill: '27 Jan 2025 - 22:00',
        status: <Badge color="green">Open</Badge>
      },
      {
        permitNo: 'WP/2025/115',
        type: 'Confined Space',
        validTill: '26 Jan 2025 - 18:00',
        status: <Badge color="yellow">Monitoring</Badge>
      },
      {
        permitNo: 'WP/2025/110',
        type: 'Working at Height',
        validTill: '25 Jan 2025 - 19:00',
        status: <Badge color="red">Closure Pending</Badge>
      }
    ],
    emptyMessage: 'No work permits issued yet.'
  }
});

export default WorkPermitPage;
