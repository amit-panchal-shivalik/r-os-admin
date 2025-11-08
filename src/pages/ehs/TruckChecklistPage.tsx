import { Badge } from '@mantine/core';
import { createEhsPage } from './templates/createEhsPage';

const TruckChecklistPage = createEhsPage({
  title: 'Truck Inspection Checklist',
  description: 'Daily inspection of dumpers and transit mixers for brakes, reverse alarms, reflective tapes, and documentation.',
  primaryActionLabel: 'Log Truck Inspection',
  metrics: [
    { label: 'Vehicles inspected (7d)', value: '28', status: 'success', helperText: 'Includes contractor fleet' },
    { label: 'RC / Insurance expiring soon', value: '3', status: 'warning', helperText: 'Coordinate with vendors' },
    { label: 'Non-conformance issued', value: '1', status: 'danger', helperText: 'Vehicle barred' }
  ],
  table: {
    columns: [
      { key: 'date', label: 'Date' },
      { key: 'vehicle', label: 'Vehicle No.' },
      { key: 'driver', label: 'Driver' },
      { key: 'status', label: 'Status' }
    ],
    rows: [
      {
        date: '27 Jan 2025',
        vehicle: 'GJ-01-FT-4921',
        driver: 'S. Kumar',
        status: <Badge color="green">Cleared</Badge>
      },
      {
        date: '26 Jan 2025',
        vehicle: 'GJ-05-TM-7812',
        driver: 'J. Thomas',
        status: <Badge color="yellow">Documents Check</Badge>
      },
      {
        date: '25 Jan 2025',
        vehicle: 'GJ-06-DM-3345',
        driver: 'A. Sheikh',
        status: <Badge color="orange">Minor Defect</Badge>
      }
    ],
    emptyMessage: 'No truck inspection data recorded.'
  }
});

export default TruckChecklistPage;
