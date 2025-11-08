import { Badge } from '@mantine/core';
import { createEhsPage } from './templates/createEhsPage';

const ExcavatorChecklistPage = createEhsPage({
  title: 'Excavator Daily Checklist',
  description: 'Pre-operation inspection checklist for excavators covering hydraulics, slew ring, alarms, and operator controls.',
  primaryActionLabel: 'Submit Excavator Checklist',
  metrics: [
    { label: 'Inspections logged (7d)', value: '18', status: 'success', helperText: 'All shifts covered' },
    { label: 'Defects reported', value: '2', status: 'warning', helperText: 'Under maintenance' },
    { label: 'Missed inspections', value: '0', status: 'success', helperText: 'Compliance achieved' }
  ],
  table: {
    columns: [
      { key: 'date', label: 'Date' },
      { key: 'equipment', label: 'Equipment ID' },
      { key: 'operator', label: 'Operator' },
      { key: 'status', label: 'Status' }
    ],
    rows: [
      {
        date: '27 Jan 2025',
        equipment: 'EXC-14',
        operator: 'R. Yadav',
        status: <Badge color="green">Cleared</Badge>
      },
      {
        date: '26 Jan 2025',
        equipment: 'EXC-11',
        operator: 'M. Singh',
        status: <Badge color="orange">Minor Defect</Badge>
      },
      {
        date: '25 Jan 2025',
        equipment: 'EXC-09',
        operator: 'H. Pandey',
        status: <Badge color="yellow">Awaiting Verification</Badge>
      }
    ],
    emptyMessage: 'No excavator inspection records available.'
  }
});

export default ExcavatorChecklistPage;
