import { Badge } from '@mantine/core';
import { createEhsPage } from './templates/createEhsPage';

const FireExtinguisherMonitoringPage = createEhsPage({
  title: 'Fire Extinguisher Monitoring',
  description: 'Track monthly inspection, refilling, and hydro test compliance for all fire extinguishers at project sites.',
  primaryActionLabel: 'Log Extinguisher Check',
  metrics: [
    { label: 'Extinguishers on site', value: '312', status: 'info', helperText: 'Across all zones' },
    { label: 'Inspection compliance', value: '96%', status: 'success', helperText: 'Target >= 95%' },
    { label: 'Hydro test due', value: '7', status: 'warning', helperText: 'Plan during shutdown' }
  ],
  table: {
    columns: [
      { key: 'location', label: 'Location' },
      { key: 'type', label: 'Type' },
      { key: 'lastChecked', label: 'Last Checked' },
      { key: 'status', label: 'Status' }
    ],
    rows: [
      {
        location: 'Block A - L2 Lobby',
        type: 'CO₂ 4.5kg',
        lastChecked: '22 Jan 2025',
        status: <Badge color="green">OK</Badge>
      },
      {
        location: 'Block C - DG Room',
        type: 'Foam 9L',
        lastChecked: '18 Jan 2025',
        status: <Badge color="yellow">Recharge Scheduled</Badge>
      },
      {
        location: 'Block B - Basement Ramp',
        type: 'ABC 6kg',
        lastChecked: '15 Jan 2025',
        status: <Badge color="red">Tag Out</Badge>
      }
    ],
    emptyMessage: 'No extinguisher monitoring data recorded yet.'
  }
});

export default FireExtinguisherMonitoringPage;
