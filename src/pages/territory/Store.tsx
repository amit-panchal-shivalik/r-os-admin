import { Paper } from '@mantine/core';
import { PageHeader } from '@/components/ui/PageHeader';

export const TerritoryStorePage = () => {
  return (
    <div>
      <PageHeader title="Territory Store" description="Inventory and store management" />
      <Paper p="md">Store content goes here.</Paper>
    </div>
  );
};

export default TerritoryStorePage;

