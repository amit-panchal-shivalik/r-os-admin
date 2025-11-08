import { Badge } from '@mantine/core';
import { createEhsPage } from './templates/createEhsPage';

const WeldingMachineChecklistPage = createEhsPage({
  title: 'Welding Machine Checklist',
  description: 'Verify welding machines for earthing, cable condition, shielding, and electrode holder safety before use.',
  primaryActionLabel: 'Submit Welding Checklist',
  metrics: [
    { label: 'Machines inspected (7d)', value: '32', status: 'success', helperText: 'Covers MIG & ARC units' },
    { label: 'Tag-outs in place', value: '3', status: 'warning', helperText: 'Awaiting maintenance clearance' },
    { label: 'Last calibration', value: '05 Jan 2025', status: 'info', helperText: 'Lab certified' }
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
        machine: 'WLD-18',
        location: 'Block A - Basement',
        status: <Badge color="green">Cleared</Badge>
      },
      {
        date: '26 Jan 2025',
        machine: 'WLD-12',
        location: 'Block C - Podium',
        status: <Badge color="red">Tag Out</Badge>
      },
      {
        date: '25 Jan 2025',
        machine: 'WLD-09',
        location: 'Fabrication Yard',
        status: <Badge color="yellow">Pending Repair</Badge>
      }
    ],
    emptyMessage: 'No welding machine inspections recorded.'
  }
});

export default WeldingMachineChecklistPage;
