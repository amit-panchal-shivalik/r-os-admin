import { Badge } from '@mantine/core';
import { createEhsPage } from './templates/createEhsPage';

const PpeRegisterPage = createEhsPage({
  title: "PPE Register",
  description: 'Maintain issuance records, validity, and replacement cycles for worker personal protective equipment.',
  primaryActionLabel: 'Issue / Update PPE',
  metrics: [
    { label: 'Issued this month', value: '142', status: 'info', helperText: 'Includes seasonal gear' },
    { label: 'Replacements pending', value: '11', status: 'warning', helperText: 'Awaiting inventory' },
    { label: 'Non-compliance notices', value: '3', status: 'danger', helperText: 'Escalated to contractor' }
  ],
  table: {
    columns: [
      { key: 'worker', label: 'Worker' },
      { key: 'ppe', label: 'PPE Item' },
      { key: 'issuedOn', label: 'Issued On' },
      { key: 'status', label: 'Status' }
    ],
    rows: [
      {
        worker: 'Deepak Singh',
        ppe: 'Full Body Harness',
        issuedOn: '22 Jan 2025',
        status: <Badge color="green">Active</Badge>
      },
      {
        worker: 'Imran Khan',
        ppe: 'Cut Resistant Gloves',
        issuedOn: '20 Jan 2025',
        status: <Badge color="yellow">Replace Soon</Badge>
      },
      {
        worker: 'Suresh Babu',
        ppe: 'Respiratory Mask',
        issuedOn: '18 Jan 2025',
        status: <Badge color="red">Replacement Overdue</Badge>
      }
    ],
    emptyMessage: 'No PPE issuance recorded yet.'
  }
});

export default PpeRegisterPage;
