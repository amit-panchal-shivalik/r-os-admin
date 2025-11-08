import { Badge } from '@mantine/core';
import { createEhsPage } from './templates/createEhsPage';

const AccidentInvestigationReportPage = createEhsPage({
  title: 'Accident Investigation Report',
  description: 'Capture root cause analysis, corrective actions, and learning outcomes for incidents and near misses.',
  primaryActionLabel: 'Create Investigation Report',
  metrics: [
    { label: 'Investigations open', value: '2', status: 'warning', helperText: 'Awaiting management review' },
    { label: 'Closed this quarter', value: '5', status: 'success', helperText: '100% action implemented' },
    { label: 'Pending RCA workshops', value: '1', status: 'info', helperText: 'Scheduled for 30 Jan' }
  ],
  table: {
    columns: [
      { key: 'ref', label: 'Report No.' },
      { key: 'date', label: 'Incident Date' },
      { key: 'type', label: 'Incident Type' },
      { key: 'status', label: 'Status' }
    ],
    rows: [
      {
        ref: 'EHS/AIR/2025/04',
        date: '22 Jan 2025',
        type: 'First Aid Case',
        status: <Badge color="yellow">Action Pending</Badge>
      },
      {
        ref: 'EHS/AIR/2025/03',
        date: '11 Jan 2025',
        type: 'Property Damage',
        status: <Badge color="green">Closed</Badge>
      },
      {
        ref: 'EHS/AIR/2024/12',
        date: '19 Dec 2024',
        type: 'Near Miss',
        status: <Badge color="blue">Under Review</Badge>
      }
    ],
    emptyMessage: 'No investigation reports created.'
  }
});

export default AccidentInvestigationReportPage;
