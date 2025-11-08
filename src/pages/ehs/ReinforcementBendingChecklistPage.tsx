import { Badge } from '@mantine/core';
import { createEhsPage } from './templates/createEhsPage';

const ReinforcementBendingChecklistPage = createEhsPage({
  title: 'Reinforcement Bending Machine Checklist',
  description: 'Daily verification of bending machine rollers, power connections, limit switches, and housekeeping.',
  primaryActionLabel: 'Record Bending Machine Check',
  metrics: [
    { label: 'Machines active', value: '6', status: 'info', helperText: 'Spread across yards' },
    { label: 'Inspections logged', value: '16', status: 'success', helperText: 'Last 7 days' },
    { label: 'Outstanding NCRs', value: '1', status: 'warning', helperText: 'Corrective action due' }
  ],
  table: {
    columns: [
      { key: 'date', label: 'Date' },
      { key: 'machine', label: 'Machine ID' },
      { key: 'location', label: 'Location' },
      { key: 'status', label: 'Status' }
    ],
    rows: [
      {
        date: '27 Jan 2025',
        machine: 'RBM-04',
        location: 'Yard 2',
        status: <Badge color="green">Cleared</Badge>
      },
      {
        date: '26 Jan 2025',
        machine: 'RBM-02',
        location: 'Yard 1',
        status: <Badge color="orange">Observation</Badge>
      },
      {
        date: '25 Jan 2025',
        machine: 'RBM-01',
        location: 'Podium',
        status: <Badge color="yellow">Follow-up</Badge>
      }
    ],
    emptyMessage: 'No bending machine inspection entries yet.'
  }
});

export default ReinforcementBendingChecklistPage;
