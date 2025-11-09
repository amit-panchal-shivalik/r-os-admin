import { Paper } from "@mantine/core";
import { PageHeader } from "@/components/ui/PageHeader";

export const TerritoryEventPage = () => {
  return (
    <>
      <div className="mt-5">
        <PageHeader
          title="Territory Events"
          description="Parcels, sites and land records"
        />
        <Paper p="md">Land content goes here.</Paper>
      </div>
    </>
  );
};

export default TerritoryEventPage;
