import { Badge } from '@mantine/core';
import { createEhsPage } from './templates/createEhsPage';

const FirstAidChecklistPage = createEhsPage({
  title: 'First Aid Box Checklist',
  description: 'Audit first aid boxes for replenishment, expiry tracking, and compliance with statutory item lists.',
  primaryActionLabel: 'Record Checklist',
  metrics: [
    { label: 'Boxes audited (7d)', value: '24', status: 'success', helperText: 'Distributed across site' },
    { label: 'Items needing refill', value: '9', status: 'warning', helperText: 'Raise purchase indent' },
    { label: 'Expired items found', value: '0', status: 'success', helperText: 'No expired stock' }
  ],
  table: {
    columns: [
      { key: 'date', label: 'Date' },
      { key: 'location', label: 'Location' },
      { key: 'auditor', label: 'Auditor' },
      { key: 'status', label: 'Status' }
    ],
    rows: [
      {
        date: '27 Jan 2025',
        location: 'Tower 1 - Level 10',
        auditor: 'P. Raut',
        status: <Badge color="green">Compliant</Badge>
      },
      {
        date: '26 Jan 2025',
        location: 'Block B - Canteen',
        auditor: 'K. Borse',
        status: <Badge color="yellow">Refill Needed</Badge>
      },
      {
        date: '25 Jan 2025',
        location: 'Site Office',
        auditor: 'Dr. Mehta',
        status: <Badge color="blue">Under Review</Badge>
      }
    ],
    emptyMessage: 'No first aid box inspections recorded yet.'
  }
});

export default FirstAidChecklistPage;
