import { Badge } from '@mantine/core';
import { createEhsPage } from './templates/createEhsPage';

const LadderInspectionChecklistPage = createEhsPage({
  title: 'Ladder Inspection Checklist',
  description: 'Ensure portable ladders are defect-free, tagged, and used with stabilizers and anti-skid arrangements.',
  primaryActionLabel: 'Log Ladder Inspection',
  metrics: [
    { label: 'Ladders in use', value: '58', status: 'info', helperText: 'Aluminium + FRP' },
    { label: 'Inspections completed (7d)', value: '34', status: 'success', helperText: 'Remaining scheduled' },
    { label: 'Quarantined ladders', value: '3', status: 'danger', helperText: 'Await replacement' }
  ],
  table: {
    columns: [
      { key: 'date', label: 'Date' },
      { key: 'ladderId', label: 'Ladder ID' },
      { key: 'location', label: 'Location' },
      { key: 'status', label: 'Status' }
    ],
    rows: [
      {
        date: '27 Jan 2025',
        ladderId: 'LAD-19',
        location: 'Block B - Level 8',
        status: <Badge color="green">Serviceable</Badge>
      },
      {
        date: '26 Jan 2025',
        ladderId: 'LAD-12',
        location: 'Block A - Terrace',
        status: <Badge color="yellow">Needs Anti-Skid</Badge>
      },
      {
        date: '25 Jan 2025',
        ladderId: 'LAD-04',
        location: 'Warehouse',
        status: <Badge color="red">Removed</Badge>
      }
    ],
    emptyMessage: 'No ladder inspection data available.'
  }
});

export default LadderInspectionChecklistPage;
