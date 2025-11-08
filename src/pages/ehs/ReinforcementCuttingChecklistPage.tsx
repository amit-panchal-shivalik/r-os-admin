import { Badge } from '@mantine/core';
import { createEhsPage } from './templates/createEhsPage';

const ReinforcementCuttingChecklistPage = createEhsPage({
  title: 'Reinforcement Cutting Machine Checklist',
  description: 'Ensure cutting machines have guards, emergency stops, and maintenance tags verified before operation.',
  primaryActionLabel: 'Log Cutting Machine Check',
  metrics: [
    { label: 'Checks completed (7d)', value: '15', status: 'success', helperText: 'No missed inspections' },
    { label: 'Lubrication due', value: '4', status: 'warning', helperText: 'Schedule with maintenance' },
    { label: 'Unsafe findings', value: '1', status: 'danger', helperText: 'Machine isolated' }
  ],
  table: {
    columns: [
      { key: 'date', label: 'Date' },
      { key: 'machine', label: 'Machine ID' },
      { key: 'inspector', label: 'Inspector' },
      { key: 'status', label: 'Status' }
    ],
    rows: [
      {
        date: '27 Jan 2025',
        machine: 'RCM-05',
        inspector: 'K. Nair',
        status: <Badge color="green">Operational</Badge>
      },
      {
        date: '26 Jan 2025',
        machine: 'RCM-03',
        inspector: 'M. Ali',
        status: <Badge color="orange">Service Required</Badge>
      },
      {
        date: '25 Jan 2025',
        machine: 'RCM-01',
        inspector: 'V. Iyer',
        status: <Badge color="yellow">Awaiting Parts</Badge>
      }
    ],
    emptyMessage: 'No cutting machine inspections logged yet.'
  }
});

export default ReinforcementCuttingChecklistPage;
