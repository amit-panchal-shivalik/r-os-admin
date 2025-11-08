import { Badge } from '@mantine/core';
import { createEhsPage } from './templates/createEhsPage';

const SafetyViolationDebitNotePage = createEhsPage({
  title: 'Safety Violation Debit Note',
  description: 'Issue debit notes to contractors for repeated safety violations and track recoveries against invoices.',
  primaryActionLabel: 'Raise Debit Note',
  metrics: [
    { label: 'Debit notes issued YTD', value: '9', status: 'info', helperText: 'Covering 4 contractors' },
    { label: 'Recovered amount', value: '₹2.4L', status: 'success', helperText: '82% recovery achieved' },
    { label: 'Pending approvals', value: '2', status: 'warning', helperText: 'Finance review in progress' }
  ],
  table: {
    columns: [
      { key: 'note', label: 'Debit Note' },
      { key: 'contractor', label: 'Contractor' },
      { key: 'amount', label: 'Amount' },
      { key: 'status', label: 'Status' }
    ],
    rows: [
      {
        note: 'DN/2025/09',
        contractor: 'ABC Infra',
        amount: '₹35,000',
        status: <Badge color="green">Recovered</Badge>
      },
      {
        note: 'DN/2025/08',
        contractor: 'Unity Build',
        amount: '₹18,500',
        status: <Badge color="yellow">Pending Payment</Badge>
      },
      {
        note: 'DN/2025/07',
        contractor: 'Prime Contractors',
        amount: '₹22,000',
        status: <Badge color="blue">Under Review</Badge>
      }
    ],
    emptyMessage: 'No debit notes issued yet.'
  }
});

export default SafetyViolationDebitNotePage;
