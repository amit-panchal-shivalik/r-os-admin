import { Badge } from '@mantine/core';
import { createEhsPage } from './templates/createEhsPage';

const MockDrillSchedulePage = createEhsPage({
  title: 'Mock Drill Schedule',
  description: 'Plan upcoming emergency drills with scenario details, participating teams, and resource readiness.',
  primaryActionLabel: 'Plan New Drill',
  metrics: [
    { label: 'Drills conducted YTD', value: '4', status: 'success', helperText: 'Fire, evacuation, medical, crane' },
    { label: 'Next drill due', value: '15 Feb 2025', status: 'info', helperText: 'Fire evacuation' },
    { label: 'Pending approvals', value: '1', status: 'warning', helperText: 'Awaiting client confirmation' }
  ],
  table: {
    columns: [
      { key: 'date', label: 'Scheduled Date' },
      { key: 'scenario', label: 'Scenario' },
      { key: 'lead', label: 'Drill Lead' },
      { key: 'status', label: 'Status' }
    ],
    rows: [
      {
        date: '15 Feb 2025',
        scenario: 'Fire Evacuation - Tower A',
        lead: 'A. Mehta',
        status: <Badge color="yellow">Planning</Badge>
      },
      {
        date: '18 Mar 2025',
        scenario: 'Medical Emergency - Fitout Area',
        lead: 'Dr. Rao',
        status: <Badge color="blue">Draft</Badge>
      },
      {
        date: '20 Apr 2025',
        scenario: 'Crane Rescue Simulation',
        lead: 'S. Thakur',
        status: <Badge color="gray">Tentative</Badge>
      }
    ],
    emptyMessage: 'No drills scheduled yet.'
  }
});

export default MockDrillSchedulePage;
