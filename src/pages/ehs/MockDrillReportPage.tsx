import { Badge } from '@mantine/core';
import { createEhsPage } from './templates/createEhsPage';

const MockDrillReportPage = createEhsPage({
  title: 'Mock Drill Report',
  description: 'Capture outcomes, response timelines, and improvement points from completed emergency drills.',
  primaryActionLabel: 'Submit Drill Report',
  metrics: [
    { label: 'Average response time', value: '04m 12s', status: 'info', helperText: 'Across last 3 drills' },
    { label: 'Corrective actions closed', value: '14/18', status: 'warning', helperText: '4 still open' },
    { label: 'Participation rate', value: '92%', status: 'success', helperText: 'Across contractor teams' }
  ],
  table: {
    columns: [
      { key: 'date', label: 'Drill Date' },
      { key: 'scenario', label: 'Scenario' },
      { key: 'lead', label: 'Lead' },
      { key: 'status', label: 'Status' }
    ],
    rows: [
      {
        date: '12 Jan 2025',
        scenario: 'Night Fire Evacuation',
        lead: 'R. Kapoor',
        status: <Badge color="green">Report Issued</Badge>
      },
      {
        date: '10 Dec 2024',
        scenario: 'Medical Emergency',
        lead: 'Dr. Shetty',
        status: <Badge color="yellow">Actions Open</Badge>
      },
      {
        date: '14 Nov 2024',
        scenario: 'Crane Emergency',
        lead: 'S. Koli',
        status: <Badge color="blue">Review Meeting</Badge>
      }
    ],
    emptyMessage: 'No drill reports submitted yet.'
  }
});

export default MockDrillReportPage;
