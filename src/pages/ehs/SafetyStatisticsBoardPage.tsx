import { Badge } from '@mantine/core';
import { createEhsPage } from './templates/createEhsPage';

const SafetyStatisticsBoardPage = createEhsPage({
  title: 'Safety Statistics Board',
  description: 'Maintain daily updated statistics for display boards – manhours worked, LTI free days, and incident trends.',
  primaryActionLabel: 'Update Statistics',
  metrics: [
    { label: 'Total safe manhours', value: '3.42M', status: 'success', helperText: 'Since project start' },
    { label: 'LTI free days', value: '186', status: 'info', helperText: 'Target: 365 days' },
    { label: 'Recordable incidents (YTD)', value: '2', status: 'warning', helperText: 'Last on 12 Dec 2024' }
  ],
  table: {
    columns: [
      { key: 'date', label: 'Date' },
      { key: 'metric', label: 'Metric' },
      { key: 'value', label: 'Value' },
      { key: 'status', label: 'Status' }
    ],
    rows: [
      {
        date: '27 Jan 2025',
        metric: 'First Aid Cases',
        value: '1',
        status: <Badge color="green">Within Threshold</Badge>
      },
      {
        date: '26 Jan 2025',
        metric: 'Near Miss',
        value: '0',
        status: <Badge color="green">Zero Harm</Badge>
      },
      {
        date: '25 Jan 2025',
        metric: 'Unsafe Observations',
        value: '6',
        status: <Badge color="yellow">Follow-up</Badge>
      }
    ],
    emptyMessage: 'No statistics logged yet.'
  }
});

export default SafetyStatisticsBoardPage;
