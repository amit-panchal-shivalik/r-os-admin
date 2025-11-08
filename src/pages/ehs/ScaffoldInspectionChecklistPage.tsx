import { Badge } from '@mantine/core';
import { createEhsPage } from './templates/createEhsPage';

const ScaffoldInspectionChecklistPage = createEhsPage({
  title: 'Scaffold Inspection Checklist',
  description: 'Daily inspection of scaffolds for tagging, bracing, access, and load conditions before use.',
  primaryActionLabel: 'Log Scaffold Inspection',
  metrics: [
    { label: 'Tagged scaffolds', value: '94%', status: 'success', helperText: 'Green tags in place' },
    { label: 'Open punches', value: '7', status: 'warning', helperText: 'Rectification by contractor' },
    { label: 'Unauthorized alterations', value: '0', status: 'success', helperText: 'Compliance maintained' }
  ],
  table: {
    columns: [
      { key: 'date', label: 'Date' },
      { key: 'scaffoldId', label: 'Scaffold ID' },
      { key: 'area', label: 'Area' },
      { key: 'status', label: 'Status' }
    ],
    rows: [
      {
        date: '27 Jan 2025',
        scaffoldId: 'SCF-112',
        area: 'Tower A - Core',
        status: <Badge color="green">Safe for Use</Badge>
      },
      {
        date: '26 Jan 2025',
        scaffoldId: 'SCF-089',
        area: 'Tower C - Atrium',
        status: <Badge color="yellow">Rectification</Badge>
      },
      {
        date: '25 Jan 2025',
        scaffoldId: 'SCF-073',
        area: 'Tower B - External',
        status: <Badge color="red">Do Not Use</Badge>
      }
    ],
    emptyMessage: 'No scaffold inspections logged.'
  }
});

export default ScaffoldInspectionChecklistPage;
