import { Badge } from '@mantine/core';
import { createEhsPage } from './templates/createEhsPage';

const EhsCoreTeamStructurePage = createEhsPage({
  title: 'EHS Core Team Structure',
  description: 'Maintain contact matrix, roles, and duty rosters for the EHS core team and emergency response members.',
  primaryActionLabel: 'Update Team Structure',
  metrics: [
    { label: 'Core team members', value: '18', status: 'info', helperText: 'Across disciplines' },
    { label: 'Emergency response trained', value: '12', status: 'success', helperText: 'Valid certifications' },
    { label: 'Vacant roles', value: '1', status: 'warning', helperText: 'Logistics coordinator' }
  ],
  table: {
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'role', label: 'Role' },
      { key: 'contact', label: 'Contact' },
      { key: 'status', label: 'Status' }
    ],
    rows: [
      {
        name: 'Anand Pillai',
        role: 'EHS Head',
        contact: '+91 98xxxxxx45',
        status: <Badge color="green">Active</Badge>
      },
      {
        name: 'Sneha Patel',
        role: 'Emergency Coordinator',
        contact: '+91 79xxxxxx12',
        status: <Badge color="green">Active</Badge>
      },
      {
        name: 'Vacant',
        role: 'Logistics Support',
        contact: '-',
        status: <Badge color="yellow">To Assign</Badge>
      }
    ],
    emptyMessage: 'No core team data available.'
  }
});

export default EhsCoreTeamStructurePage;
