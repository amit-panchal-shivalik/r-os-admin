import { Badge } from '@mantine/core';
import { createEhsPage } from './templates/createEhsPage';

const EhsCommitteeMomPage = createEhsPage({
  title: 'EHS Committee Meeting - Minutes',
  description: 'Document agenda, deliberations, and action items from monthly EHS committee meetings.',
  primaryActionLabel: 'Record Meeting Minutes',
  metrics: [
    { label: 'Meetings held YTD', value: '10', status: 'success', helperText: 'As per statutory requirement' },
    { label: 'Action items open', value: '6', status: 'warning', helperText: 'Follow-up with stakeholders' },
    { label: 'Attendance compliance', value: '94%', status: 'info', helperText: 'Average participation' }
  ],
  table: {
    columns: [
      { key: 'meeting', label: 'Meeting' },
      { key: 'date', label: 'Date' },
      { key: 'chair', label: 'Chairperson' },
      { key: 'status', label: 'Status' }
    ],
    rows: [
      {
        meeting: 'EHS/2025/01',
        date: '19 Jan 2025',
        chair: 'Project Director',
        status: <Badge color="green">MOM Circulated</Badge>
      },
      {
        meeting: 'EHS/2024/12',
        date: '20 Dec 2024',
        chair: 'EHS Head',
        status: <Badge color="yellow">Action Review</Badge>
      },
      {
        meeting: 'EHS/2024/11',
        date: '21 Nov 2024',
        chair: 'Project Director',
        status: <Badge color="blue">Closed</Badge>
      }
    ],
    emptyMessage: 'No meeting records captured.'
  }
});

export default EhsCommitteeMomPage;
