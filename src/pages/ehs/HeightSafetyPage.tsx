import { Badge } from '@mantine/core';
import { createEhsPage } from './templates/createEhsPage';

const HeightSafetyPage = createEhsPage({
  title: 'Height Safety Compliance',
  description: 'Monitor permits, anchor point inspections, and compliance for work-at-height activities.',
  primaryActionLabel: 'Log Height Safety Check',
  metrics: [
    { label: 'Active height permits', value: '21', status: 'info', helperText: 'Live permits today' },
    { label: 'Harness inspections due', value: '6', status: 'warning', helperText: 'Schedule this week' },
    { label: 'Violations reported', value: '1', status: 'danger', helperText: 'Under investigation' }
  ],
  table: {
    columns: [
      { key: 'date', label: 'Date' },
      { key: 'location', label: 'Location' },
      { key: 'activity', label: 'Activity' },
      { key: 'status', label: 'Status' }
    ],
    rows: [
      {
        date: '27 Jan 2025',
        location: 'Tower C - Terrace',
        activity: 'Glazing Fixing',
        status: <Badge color="green">Compliant</Badge>
      },
      {
        date: '26 Jan 2025',
        location: 'Tower B - Atrium',
        activity: 'Facade Cleaning',
        status: <Badge color="yellow">Observation Raised</Badge>
      },
      {
        date: '25 Jan 2025',
        location: 'Tower A - Lift Lobby',
        activity: 'MEP Installations',
        status: <Badge color="orange">Permit Hold</Badge>
      }
    ],
    emptyMessage: 'No height safety entries recorded.'
  }
});

export default HeightSafetyPage;
