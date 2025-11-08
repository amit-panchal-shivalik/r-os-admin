import { Badge } from '@mantine/core';
import { createEhsPage } from './templates/createEhsPage';

const JcbChecklistPage = createEhsPage({
  title: 'JCB Checklist',
  description: 'Daily inspection checklist for backhoe loaders, ensuring safe operation and housekeeping compliance.',
  primaryActionLabel: 'Log JCB Inspection',
  metrics: [
    { label: 'Machines in service', value: '7', status: 'info', helperText: 'Across all blocks' },
    { label: 'Reports submitted (7d)', value: '14', status: 'success', helperText: 'Twice per day coverage' },
    { label: 'Open defects', value: '1', status: 'warning', helperText: 'Awaiting spare part' }
  ],
  table: {
    columns: [
      { key: 'date', label: 'Date' },
      { key: 'equipment', label: 'Machine ID' },
      { key: 'shift', label: 'Shift' },
      { key: 'status', label: 'Status' }
    ],
    rows: [
      {
        date: '27 Jan 2025',
        equipment: 'JCB-05',
        shift: 'Day',
        status: <Badge color="green">Operational</Badge>
      },
      {
        date: '26 Jan 2025',
        equipment: 'JCB-03',
        shift: 'Night',
        status: <Badge color="yellow">Monitoring</Badge>
      },
      {
        date: '25 Jan 2025',
        equipment: 'JCB-01',
        shift: 'Day',
        status: <Badge color="orange">Minor Repair</Badge>
      }
    ],
    emptyMessage: 'No JCB inspection data logged.'
  }
});

export default JcbChecklistPage;
