import { Badge } from '@mantine/core';
import { createEhsPage } from './templates/createEhsPage';

const PortableElectricalToolsPage = createEhsPage({
  title: "Portable Electrical Equipment Register",
  description: 'Maintain inventory, testing schedule, and tagging status for portable electrical tools and power leads.',
  primaryActionLabel: 'Log Equipment Test',
  metrics: [
    { label: 'Tools in inventory', value: '214', status: 'info', helperText: 'Updated weekly' },
    { label: 'PAT testing due', value: '17', status: 'warning', helperText: 'Schedule within 14 days' },
    { label: 'Tagged out tools', value: '5', status: 'danger', helperText: 'Remove from service' }
  ],
  table: {
    columns: [
      { key: 'tool', label: 'Equipment' },
      { key: 'tag', label: 'Tag No.' },
      { key: 'nextTest', label: 'Next Test Due' },
      { key: 'status', label: 'Status' }
    ],
    rows: [
      {
        tool: 'Angle Grinder',
        tag: 'ELEC-089',
        nextTest: '18 Feb 2025',
        status: <Badge color="green">Tagged</Badge>
      },
      {
        tool: 'Hand Drill',
        tag: 'ELEC-102',
        nextTest: '05 Feb 2025',
        status: <Badge color="yellow">Due Soon</Badge>
      },
      {
        tool: 'Extension Cord',
        tag: 'ELEC-054',
        nextTest: 'Overdue',
        status: <Badge color="red">Quarantined</Badge>
      }
    ],
    emptyMessage: 'No portable equipment records found.'
  }
});

export default PortableElectricalToolsPage;
