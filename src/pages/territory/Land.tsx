import { Paper } from '@mantine/core';
import { PageHeader } from '@/components/ui/PageHeader';

export const TerritoryLandPage = () => {
  return (
    <div>
      <PageHeader title="Territory Land" description="Parcels, sites and land records" />
      <Paper p="md">Land content goes here.</Paper>
    </div>
  );
};

export default TerritoryLandPage;

