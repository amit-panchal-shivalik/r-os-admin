import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Modal,
  TextInput,
  Select as MantineSelect,
  NumberInput,
  Textarea,
  Group,
  Paper,
  Text,
  Badge,
  Card,
  ScrollArea,
} from "@mantine/core";
import { useForm, Controller } from "react-hook-form";
import { notifications } from "@mantine/notifications";
import { Icon } from "@iconify/react";
import type { Option } from "@/types/CustomInputTypes";
import { usePermissions } from "@/hooks/usePermissions";
import { useTerritorySelection } from "@/context/TerritoryContext";
import { createOpportunity } from "@/apis/opportunityService";
import {
  CreateOpportunityPayload,
  Opportunity as OpportunityType,
} from "@/types/ApiTypes";
  import { DEFAULT_TERRITORY_ID } from "@/utils/Constant";
  import { openChatWithPeer } from "@/lib/chat";

type OpportunityFormValues = {
  territoryId: string;
  opportunityType:
    | "Buyer Requirement"
    | "Rental Requirement"
    | "Land Parcel"
    | "Joint Development"
    | "";
  title: string;
  description: string;
  budgetMin?: number | undefined;
  budgetMax?: number | undefined;
};

type OpportunityCard = OpportunityType & {
  opportunityType: OpportunityFormValues["opportunityType"];
  budgetMin?: number;
  budgetMax?: number;
};

const OPPORTUNITY_TYPES: Option[] = [
  { value: "Buyer Requirement", label: "Buyer Requirement" },
  { value: "Rental Requirement", label: "Rental Requirement" },
  { value: "Land Parcel", label: "Land Parcel" },
  { value: "Joint Development", label: "Joint Development" },
];

export const TerritoryOpportunityPage = () => {
  const [open, setOpen] = useState<boolean>(false);
  const { canCreate } = usePermissions();
  const allowCreate = canCreate("opportunity");
  const initialItems: OpportunityCard[] = useMemo(
    () => [
      {
        opportunity_id: "o1",
        territory_id: "t1",
        type: "Rental Requirement",
        title: "Corporate client needs 10 rental flats",
        description:
          "Looking for 2BHK furnished units near SG Highway with parking.",
        status: "open",
        created_by: "System",
        created_at: new Date().toISOString(),
        opportunityType: "Rental Requirement",
        budgetMin: "₹ 16000",
        budgetMax: "₹ 18000",
      },
      {
        opportunity_id: "o2",
        territory_id: "t3",
        type: "Buyer Requirement",
        title: "Bulk purchase of 2/3BHK units",
        description:
          "Prefer ready-to-move 2/3BHK units in a single society (bulk).",
        status: "open",
        created_by: "System",
        created_at: new Date().toISOString(),
        opportunityType: "Buyer Requirement",
        budgetMin: "₹ 20,000",
        budgetMax: "₹ 50,000",
      },
      {
        opportunity_id: "o3",
        territory_id: "t2",
        type: "Joint Development",
        title: "8-acre land parcel JV proposal",
        description:
          "Landowner seeking reputed developer for residential JD near SP Ring Road.",
        status: "pending",
        created_by: "System",
        created_at: new Date().toISOString(),
        opportunityType: "Joint Development",
      },
      {
        opportunity_id: "o4",
        territory_id: "t4",
        type: "Land Parcel",
        title: "3-acre plotted development opportunity",
        description:
          "Clear title, main road access; suitable for premium plots.",
        status: "open",
        created_by: "System",
        created_at: new Date().toISOString(),
        opportunityType: "Land Parcel",
        budgetMin: "₹ 1.2 Cr",
        budgetMax: "₹ 2.8 Cr",
      },
    ],
    []
  );
  const { territories, selectedTerritory } = useTerritorySelection();
  const [items, setItems] = useState<OpportunityCard[]>(initialItems);
  const [selected, setSelected] = useState<OpportunityCard | null>(null);
  const territoryId = selectedTerritory?.id || DEFAULT_TERRITORY_ID;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const fallbackTerritoryOptions: Option[] = useMemo(
    () => [
      { value: "t1", label: "North Territory" },
      { value: "t2", label: "South Territory" },
      { value: "t3", label: "East Territory" },
      { value: "t4", label: "West Territory" },
    ],
    []
  );
  const territoryOptions: Option[] = useMemo(
    () =>
      territories.length
        ? territories.map((t) => ({ value: t.id, label: t.name }))
        : fallbackTerritoryOptions,
    [territories, fallbackTerritoryOptions]
  );

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    getValues,
  } = useForm<OpportunityFormValues>({
    defaultValues: {
      territoryId: "",
      opportunityType: "",
      title: "",
      description: "",
      budgetMin: undefined,
      budgetMax: undefined,
    },
    mode: "onChange", // show validation as user interacts
    reValidateMode: "onBlur",
  });

  const openModal = () => {
    if (!allowCreate) return;
    reset({
      territoryId: "",
      opportunityType: "",
      title: "",
      description: "",
      budgetMin: undefined,
      budgetMax: undefined,
    });
    setOpen(true);
  };

  const closeModal = () => {
    setIsSubmitting(false);
    setServerError(null);
    reset({
      territoryId: "",
      opportunityType: "",
      title: "",
      description: "",
      budgetMin: undefined,
      budgetMax: undefined,
    });
    setOpen(false);
  };

  const onSubmit = (data: OpportunityFormValues) => {
    if (!allowCreate) return;
    const { budgetMin, budgetMax } = data;
    if (
      typeof budgetMin === "number" &&
      typeof budgetMax === "number" &&
      budgetMax < budgetMin
    ) {
      notifications.show({
        color: "red",
        title: "Validation error",
        message: "Max budget must be greater than or equal to min budget",
      });
      return;
    }
    setIsSubmitting(true);
    setServerError(null);
    const payload: CreateOpportunityPayload = {
      territory_id: data.territoryId || territoryId,
      type: data.opportunityType,
      title: data.title,
      description: data.description,
    };
    createOpportunity(payload)
      .then((response) => {
        const card: OpportunityCard = {
          ...response,
          opportunityType: response.type || data.opportunityType,
          budgetMin,
          budgetMax,
          territory_id:
            response.territory_id || data.territoryId || territoryId,
        };
        setItems((prev) => [card, ...prev]);
        notifications.show({
          title: "Opportunity added",
          message: response.title || data.title,
        });
        closeModal();
      })
      .catch((error: any) => {
        const message =
          error?.message || "Unable to submit opportunity. Please try again.";
        setServerError(message);
        notifications.show({
          color: "red",
          title: "Submission failed",
          message,
        });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <>
      <div className="mt-5">
        <div className="flex items-start justify-between gap-2 flex-col sm:flex-row">
          <PageHeader
            title="Opportunities"
            description="Track buyer, rental and land opportunities"
          />
          {allowCreate && (
            <Button
              onClick={openModal}
              className="h-9 px-3 text-xs sm:h-10 sm:px-4 sm:text-sm"
            >
              <Icon icon="fa:plus" />
              Add New Opportunity
            </Button>
          )}
        </div>
        <Paper p="md" mt="md">
          {items.length === 0 ? (
            <Text c="dimmed" size="sm">
              No opportunities yet. Add your first one.
            </Text>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {items.map((o, idx) => {
                const territoryKey =
                  o.territory_id || (o as any).territoryId || "";
                const territoryLabel =
                  territoryOptions.find((t) => t.value === territoryKey)
                    ?.label ||
                  territoryKey ||
                  "Primary Territory";
                const typeLabel = (o.opportunityType ||
                  o.type ||
                  "Opportunity") as
                  | OpportunityFormValues["opportunityType"]
                  | string;
                const color: any =
                  typeLabel === "Buyer Requirement"
                    ? "blue"
                    : typeLabel === "Rental Requirement"
                    ? "teal"
                    : typeLabel === "Land Parcel"
                    ? "orange"
                    : typeLabel === "Joint Development"
                    ? "grape"
                    : "gray";
                return (
                  <Card
                    key={o.opportunity_id || `${typeLabel}-${idx}`}
                    withBorder
                    radius="md"
                    shadow="sm"
                    className="hover:shadow-md transition overflow-hidden cursor-pointer"
                    onClick={() => setSelected(o)}
                  >
                    <Card.Section>
                      <div className={`h-1.5 w-full bg-${color}-500`} />
                    </Card.Section>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <Text fw={700} className="leading-snug line-clamp-2">
                          {o.title}
                        </Text>
                      </div>
                      <div className="mt-1 flex items-center gap-2 flex-wrap">
                        <Badge variant="light" color={color}>{typeLabel}</Badge>
                        {o.status && (
                          <Badge variant="dot" size="sm" color={o.status === "open" ? "green" : o.status === "pending" ? "yellow" : "gray"}>
                            {o.status}
                          </Badge>
                        )}
                      </div>
                      <Text size="sm" c="dimmed" className="mt-1">
                        {territoryLabel}
                      </Text>
                      <div className="mt-2 flex items-center flex-wrap gap-2">
                        <Badge variant="outline" color={color} size="sm">Min: {o.budgetMin ?? "-"}</Badge>
                        <Badge variant="outline" color={color} size="sm">Max: {o.budgetMax ?? "-"}</Badge>
                      </div>
                      {o.description && (
                        <Text size="sm" className="mt-2 line-clamp-3">
                          {o.description}
                        </Text>
                      )}
                      <div className="mt-3 flex items-center justify-end">
                        <Button
                          className="h-7 px-3 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelected(o);
                          }}
                        >
                          View details
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </Paper>
      </div>

      <Modal
        opened={open}
        onClose={closeModal}
        title={<span className="font-semibold">Add Opportunity</span>}
        centered
      >
        <div className="no-scrollbar max-h-[70vh] overflow-y-auto pr-1">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {serverError && (
              <Text size="xs" c="red">
                {serverError}
              </Text>
            )}
            <Controller
              control={control}
              name="territoryId"
              rules={{ required: "Territory is required" }}
              render={({ field }) => (
                <MantineSelect
                  label="Territory"
                  placeholder="Select territory"
                  searchable
                  data={territoryOptions}
                  value={field.value}
                  onChange={(val) => field.onChange(val || "")}
                  withAsterisk
                  error={errors.territoryId?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="opportunityType"
              rules={{ required: "Opportunity type is required" }}
              render={({ field }) => (
                <MantineSelect
                  label="Opportunity Type"
                  placeholder="Select type"
                  data={OPPORTUNITY_TYPES}
                  value={field.value}
                  onChange={(val) => field.onChange(val || "")}
                  withAsterisk
                  error={errors.opportunityType?.message}
                />
              )}
            />

            <TextInput
              label="Title"
              placeholder="Corporate Client needs 10 rental flats"
              withAsterisk
              {...register("title", { required: "Title is required" })}
              error={errors.title?.message}
            />

            <Textarea
              label="Description"
              placeholder="Add relevant details"
              minRows={3}
              withAsterisk
              {...register("description", {
                required: "Description is required",
              })}
              error={errors.description?.message}
            />

            <Group grow>
              <Controller
                control={control}
                name="budgetMin"
                render={({ field }) => (
                  <NumberInput
                    label="Budget Min (optional)"
                    placeholder="0"
                    min={0}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                control={control}
                name="budgetMax"
                rules={{
                  validate: (val) => {
                    const min = getValues("budgetMin");
                    if (typeof val === "number" && typeof min === "number") {
                      return (
                        val >= min ||
                        "Max budget must be greater than or equal to min budget"
                      );
                    }
                    return true;
                  },
                }}
                render={({ field }) => (
                  <NumberInput
                    label="Budget Max (optional)"
                    placeholder="0"
                    min={0}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.budgetMax?.message}
                  />
                )}
              />
            </Group>

            <Group justify="flex-end" mt="md">
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!isValid || isSubmitting}
                loading={isSubmitting}
              >
                Add Opportunity
              </Button>
            </Group>
          </form>
        </div>
      </Modal>

      {/* View Opportunity Modal */}
      <Modal
        opened={!!selected}
        onClose={() => setSelected(null)}
        size="xl"
        centered
        title={selected ? <Text fw={700}>{selected.title}</Text> : undefined}
      >
        {selected && (
          <ScrollArea.Autosize mah={"70vh"} className="pr-1">
            <div className="space-y-3">
              <Group gap={8}>
                <Badge variant="light">
                  {selected.opportunityType || selected.type}
                </Badge>
                {selected.status && (
                  <Badge
                    variant="dot"
                    color={
                      selected.status === "open"
                        ? "green"
                        : selected.status === "pending"
                        ? "yellow"
                        : "gray"
                    }
                  >
                    {selected.status}
                  </Badge>
                )}
              </Group>
              <Text size="sm" c="dimmed">
                {territoryOptions.find(
                  (t) =>
                    t.value ===
                    (selected.territory_id || (selected as any).territoryId)
                )?.label ||
                  selected.territory_id ||
                  "Primary Territory"}
              </Text>
              <Group gap={8}>
                <Badge variant="outline">
                  Budget Min: {selected.budgetMin ?? "-"}
                </Badge>
                <Badge variant="outline">
                  Budget Max: {selected.budgetMax ?? "-"}
                </Badge>
              </Group>
              {selected.description && (
                <Text size="sm">{selected.description}</Text>
              )}
              <div className="text-xs text-gray-500">
                {selected.created_by && (
                  <div>Created by: {selected.created_by}</div>
                )}
                {selected.created_at && (
                  <div>
                    Created at: {new Date(selected.created_at).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea.Autosize>
        )}
      </Modal>

      {/* View Opportunity Modal */}
      <Modal
        opened={!!selected}
        onClose={() => setSelected(null)}
        size="xl"
        centered
        title={selected ? <Text fw={700}>{selected.title}</Text> : undefined}
      >
        {selected && (
          <ScrollArea.Autosize mah={"70vh"} className="pr-1">
            <div className="space-y-3">
              <Group gap={8}>
                <Badge variant="light">
                  {selected.opportunityType || selected.type}
                </Badge>
                {selected.status && (
                  <Badge
                    variant="dot"
                    color={
                      selected.status === "open"
                        ? "green"
                        : selected.status === "pending"
                        ? "yellow"
                        : "gray"
                    }
                  >
                    {selected.status}
                  </Badge>
                )}
              </Group>
              <Text size="sm" c="dimmed">
                {territoryOptions.find(
                  (t) =>
                    t.value ===
                    (selected.territory_id || (selected as any).territoryId)
                )?.label ||
                  selected.territory_id ||
                  "Primary Territory"}
              </Text>
              <Group gap={8}>
                <Badge variant="outline">
                  Budget Min: {selected.budgetMin ?? "-"}
                </Badge>
                <Badge variant="outline">
                  Budget Max: {selected.budgetMax ?? "-"}
                </Badge>
              </Group>
              {selected.description && (
                <Text size="sm">{selected.description}</Text>
              )}
              <div className="text-xs text-gray-500">
                {selected.created_by && (
                  <div>Created by: {selected.created_by}</div>
                )}
                {selected.created_at && (
                  <div>
                    Created at: {new Date(selected.created_at).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea.Autosize>
        )}
      </Modal>
    </>
  );
};

export default TerritoryOpportunityPage;
