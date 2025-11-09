import { Badge } from '@mantine/core';
import { createEhsPage } from './templates/createEhsPage';

const FullBodyHarnessInspectionPage = createEhsPage({
  title: 'Full Body Harness Inspection',
  description: 'Record periodic inspections of safety harnesses – webbing, buckles, stitching, and tagging.',
  primaryActionLabel: 'Log Harness Inspection',
  metrics: [
    { label: 'Harnesses in use', value: '138', status: 'info', helperText: 'Across contractors' },
    { label: 'Inspections completed (30d)', value: '126', status: 'success', helperText: 'Balance scheduled' },
    { label: 'Harnesses rejected', value: '5', status: 'danger', helperText: 'Replace immediately' }
  ],
  table: {
    columns: [
      { key: 'date', label: 'Date' },
      { key: 'harnessId', label: 'Harness ID' },
      { key: 'inspector', label: 'Inspector' },
      { key: 'status', label: 'Status' }
    ],
    rows: [
      {
        date: '27 Jan 2025',
        harnessId: 'FBH-212',
        inspector: 'L. Solanki',
        status: <Badge color="green">Pass</Badge>
      },
      {
        date: '26 Jan 2025',
        harnessId: 'FBH-198',
        inspector: 'A. Kaur',
        status: <Badge color="yellow">Retest Required</Badge>
      },
      {
        date: '24 Jan 2025',
        harnessId: 'FBH-185',
        inspector: 'R. Das',
        status: <Badge color="red">Reject</Badge>
      }
    ],
    emptyMessage: 'No harness inspection records yet.'
  }
});

export default FullBodyHarnessInspectionPage;
