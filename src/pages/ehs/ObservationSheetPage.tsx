import { Badge } from '@mantine/core';
import { createEhsPage } from './templates/createEhsPage';

const ObservationSheetPage = createEhsPage({
  title: 'Safety Observation Sheet',
  description: 'Log positive observations, unsafe acts/conditions, and track closure of assigned actions.',
  primaryActionLabel: 'Register Observation',
  metrics: [
    { label: 'Observations logged (30d)', value: '74', status: 'info', helperText: 'Mix of positive + negative' },
    { label: 'Closed observations', value: '61', status: 'success', helperText: '82% closure rate' },
    { label: 'Open high-risk findings', value: '4', status: 'danger', helperText: 'Escalated to site head' }
  ],
  table: {
    columns: [
      { key: 'date', label: 'Date' },
      { key: 'category', label: 'Category' },
      { key: 'assignedTo', label: 'Assigned To' },
      { key: 'status', label: 'Status' }
    ],
    rows: [
      {
        date: '27 Jan 2025',
        category: 'Housekeeping',
        assignedTo: 'Logistics Team',
        status: <Badge color="green">Closed</Badge>
      },
      {
        date: '26 Jan 2025',
        category: 'PPE Non-compliance',
        assignedTo: 'Contractor B',
        status: <Badge color="yellow">In Progress</Badge>
      },
      {
        date: '24 Jan 2025',
        category: 'Working at Height',
        assignedTo: 'HS Team',
        status: <Badge color="red">Critical</Badge>
      }
    ],
    emptyMessage: 'No observations captured yet.'
  }
});

export default ObservationSheetPage;
