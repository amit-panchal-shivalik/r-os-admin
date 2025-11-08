import { Badge } from '@mantine/core';
import { createEhsPage } from './templates/createEhsPage';

const EquipmentTestingMonitoringPage = createEhsPage({
  title: "Equipment Testing Monitoring",
  description: 'Track statutory testing, calibration, and certification status for critical equipment at site.',
  primaryActionLabel: 'Log Testing Record',
  metrics: [
    { label: 'Equipments certified', value: '128', status: 'success', helperText: 'Within validity period' },
    { label: 'Tests due in 30 days', value: '11', status: 'warning', helperText: 'Schedule inspections' },
    { label: 'Overdue equipment', value: '3', status: 'danger', helperText: 'Restrict usage immediately' }
  ],
  table: {
    columns: [
      { key: 'equipment', label: 'Equipment' },
      { key: 'lastTested', label: 'Last Tested' },
      { key: 'nextDue', label: 'Next Due' },
      { key: 'status', label: 'Status' }
    ],
    rows: [
      {
        equipment: 'Tower Crane 02',
        lastTested: '05 Jan 2025',
        nextDue: '05 Apr 2025',
        status: <Badge color="green">Valid</Badge>
      },
      {
        equipment: 'Passenger Hoist A',
        lastTested: '12 Dec 2024',
        nextDue: '12 Mar 2025',
        status: <Badge color="yellow">Due Soon</Badge>
      },
      {
        equipment: 'Boom Lift 07',
        lastTested: '08 Aug 2024',
        nextDue: 'Overdue',
        status: <Badge color="red">Action Required</Badge>
      }
    ],
    emptyMessage: 'No equipment testing data available.'
  }
});

export default EquipmentTestingMonitoringPage;
