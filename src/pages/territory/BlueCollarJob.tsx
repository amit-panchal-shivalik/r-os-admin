import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  Badge,
  Card,
  Group,
  Image,
  Modal,
  Rating,
  Text,
  TextInput,
  Avatar,
  ScrollArea,
  Checkbox,
  NumberInput,
} from "@mantine/core";
import {
  IconCheck,
  IconMessageCircle,
  IconPhone,
  IconId,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { useForm, Controller } from "react-hook-form";
import { usePermissions } from "@/hooks/usePermissions";
import { fetchTerritoryProfessionals } from "@/apis/territoryService";
import { Professional } from "@/types/ApiTypes";
import { DEFAULT_TERRITORY_ID } from "@/utils/Constant";
import { useTerritorySelection } from "@/context/TerritoryContext";

type Category =
  | "Beauty Salon"
  | "Plumber"
  | "Carpenter"
  | "Maid Agency"
  | "Electrician"
  | "Painter"
  | "AC Service"
  | "Pest Control"
  | string;

interface Provider {
  id: string;
  name: string;
  category: Category;
  rating: number; // 0-5
  reviews: number; // comments count
  verified: boolean;
  charges: string; // e.g., "?300/hour"
  phone: string;
  photoUrl?: string;
  description: string;
  experienceYears?: number;
  address?: string;
}

const PLACEHOLDER = ""; // use Avatar fallback when photo missing

const mapProfessionalToProvider = (prof: Professional): Provider => {
  const contact = prof.contact_info as Record<string, any> | undefined;
  const category =
    (prof.profession as Category) ||
    (contact?.category as Category) ||
    "Service Provider";
  return {
    id: prof.user_id || `prof-${Math.random().toString(36).slice(2, 9)}`,
    name: prof.full_name || "Professional",
    category,
    rating: contact?.rating ?? 4.2,
    reviews: contact?.reviews ?? 0,
    verified: prof.is_verified ?? false,
    charges: contact?.charges || "₹ 0",
    phone: contact?.phone || "+91 00000 00000",
    photoUrl: contact?.avatar_url,
    description:
      (contact?.description as string) ||
      "Verified service provider ready to help.",
    experienceYears: contact?.experienceYears,
    address: contact?.address as string | undefined,
  };
};

export const TerritoryBlueCollarJobPage = () => {
  const categories: Category[] = useMemo(
    () => [
      "Beauty Salon",
      "Plumber",
      "Carpenter",
      "Maid Agency",
      "Electrician",
      "Painter",
      "AC Service",
      "Pest Control",
    ],
    []
  );

  const initialData: Provider[] = useMemo(
    () => [
      {
        id: "BCJ-1001",
        name: "Glow & Go Salon",
        category: "Beauty Salon",
        rating: 4.6,
        reviews: 128,
        verified: true,
        charges: "₹ 699 / session",
        phone: "+91 98765 43210",
        photoUrl: undefined,
        description: "Home-visit grooming, bridal makeup, and hair styling.",
        experienceYears: 5,
        address: "Vastrapur, Ahmedabad",
      },
      {
        id: "BCJ-2002",
        name: "RapidFix Plumbers",
        category: "Plumber",
        rating: 4.3,
        reviews: 89,
        verified: true,
        charges: "₹ 350 / visit",
        phone: "+91 98250 11122",
        photoUrl: undefined,
        description: "Leak repair, fixture installs, and urgent plumbing.",
        experienceYears: 7,
        address: "Bodakdev, Ahmedabad",
      },
      {
        id: "BCJ-3003",
        name: "CraftWood Carpentry",
        category: "Carpenter",
        rating: 4.7,
        reviews: 64,
        verified: true,
        charges: "₹ 500 / hour",
        phone: "+91 99090 22233",
        photoUrl: undefined,
        description: "Modular furniture, door/window repair, and custom work.",
        experienceYears: 9,
        address: "Ambli, Ahmedabad",
      },
      {
        id: "BCJ-4004",
        name: "SwiftClean Maid Agency",
        category: "Maid Agency",
        rating: 4.2,
        reviews: 152,
        verified: false,
        charges: "₹ 10,000 / month",
        phone: "+91 97123 45678",
        photoUrl: undefined,
        description: "Full-time/part-time maids with background verification.",
        experienceYears: 3,
        address: "Satellite, Ahmedabad",
      },
      {
        id: "BCJ-5005",
        name: "SparkVolt Electricians",
        category: "Electrician",
        rating: 4.5,
        reviews: 98,
        verified: true,
        charges: "₹ 400 / visit",
        phone: "+91 98989 44455",
        photoUrl: undefined,
        description: "Wiring, lighting, inverter, and panel servicing.",
        experienceYears: 6,
        address: "Thaltej, Ahmedabad",
      },
      {
        id: "BCJ-6006",
        name: "Prime Painters",
        category: "Painter",
        rating: 4.1,
        reviews: 56,
        verified: false,
        charges: "₹ 20 / sq.ft.",
        phone: "+91 91234 56780",
        photoUrl: undefined,
        description: "Interior/exterior painting and waterproofing.",
        experienceYears: 8,
        address: "Navrangpura, Ahmedabad",
      },
      {
        id: "BCJ-7007",
        name: "CoolCare AC Service",
        category: "AC Service",
        rating: 4.4,
        reviews: 77,
        verified: true,
        charges: "₹ 699 / service",
        phone: "+91 98765 12345",
        photoUrl: undefined,
        description: "AC servicing, gas refill, installation, and cleaning.",
        experienceYears: 4,
        address: "Maninagar, Ahmedabad",
      },
      {
        id: "BCJ-8008",
        name: "SafeHome Pest Control",
        category: "Pest Control",
        rating: 4.3,
        reviews: 65,
        verified: true,
        charges: "₹ 1,499 / 2BHK",
        phone: "+91 99890 11223",
        photoUrl: undefined,
        description: "Termite, cockroach, and bed-bug treatments.",
        experienceYears: 10,
        address: "Gota, Ahmedabad",
      },
    ],
    []
  );

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<Category | "All">("All");
  const [selected, setSelected] = useState<Provider | null>(null);
  const [openNewJobModal, setOpenNewJobModal] = useState<boolean>(false);
  const [providers, setProviders] = useState<Provider[]>(initialData);
  const { canCreate } = usePermissions();
  const allowCreate = canCreate("blueCollarJob");
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const { selectedTerritory } = useTerritorySelection();
  const territoryId = selectedTerritory?.id ?? DEFAULT_TERRITORY_ID;
  useEffect(() => {
    setApiLoading(true);
    fetchTerritoryProfessionals(territoryId)
      .then((response) => {
        if (response.professionals?.length) {
          setProviders(
            response.professionals.map((prof) =>
              mapProfessionalToProvider(prof)
            )
          );
        }
        setApiError(null);
      })
      .catch((error: any) => {
        setApiError(error?.message || "Unable to load professionals.");
      })
      .finally(() => {
        setApiLoading(false);
      });
  }, [territoryId]);

  type FormValues = {
    name: string;
    category: Category | "";
    charges: string;
    phone: string;
    rating?: number;
    reviews?: number;
    experienceYears?: number;
    address?: string;
    photoUrl?: string;
    description: string;
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<FormValues>({
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      category: "",
      charges: "",
      phone: "",
      rating: 4,
      reviews: 0,
      experienceYears: undefined,
      address: "",
      photoUrl: "",
      description: "",
    },
  });

  const onAddHelper = (data: FormValues) => {
    if (!allowCreate) return;
    const newItem: Provider = {
      id: `BCJ-${Math.floor(1000 + Math.random() * 9000)}`,
      name: data.name,
      category: data.category as Category,
      rating: Number(data.rating ?? 0),
      reviews: Number(data.reviews ?? 0),
      verified: true,
      charges: data.charges,
      phone: data.phone,
      photoUrl: data.photoUrl || undefined,
      description: data.description,
      experienceYears: data.experienceYears,
      address: data.address,
    };
    setProviders((prev) => [newItem, ...prev]);
    setOpenNewJobModal(false);
    reset();
  };

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return providers.filter((p) => {
      const matchesCat = activeFilter === "All" || p.category === activeFilter;
      const matchesSearch =
        !s ||
        p.name.toLowerCase().includes(s) ||
        p.category.toLowerCase().includes(s) ||
        (p.address || "").toLowerCase().includes(s);
      return matchesCat && matchesSearch;
    });
  }, [providers, activeFilter, search]);

  const handleOpenAddHelper = () => {
    if (!allowCreate) return;
    setOpenNewJobModal(true);
  };

  return (
    <>
      <div className="mt-5">
        <div className="flex justify-between item-center">
          <PageHeader
            title="Household Helpers"
            description="Find verified service providers for everyday needs"
          />
          <div>
            {allowCreate && (
              <Button
                onClick={() => handleOpenAddHelper()}
                className="h-9 px-3 text-xs sm:h-10 sm:px-4 sm:text-sm"
              >
                <Icon icon="fa:plus" />
                Add New Helper
              </Button>
            )}
          </div>
        </div>
        {/* Filters + Search */}
        <Group justify="space-between" className="mb-3">
          <Group gap="xs" className="flex-wrap">
            <Button
              onClick={() => setActiveFilter("All")}
              className={
                (activeFilter === "All"
                  ? "bg-[#272e3f] text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200") +
                " h-8 px-3 text-xs hover:bg-[#272e3f]  hover:text-white"
              }
            >
              All
            </Button>
            {categories.map((c) => (
              <Button
                key={c}
                onClick={() => setActiveFilter(c)}
                className={
                  (activeFilter === c
                    ? "bg-[#272e3f] text-white"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200") +
                  " h-8 px-3 text-xs hover:bg-[#272e3f]  hover:text-white"
                }
              >
                {c}
              </Button>
            ))}
          </Group>
          <TextInput
            placeholder="Search by name, category or area"
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            className="w-full md:w-[280px]"
          />
        </Group>
        {apiLoading && (
          <Text size="xs" c="dimmed" className="mb-2">
            Refreshing service providers…
          </Text>
        )}
        {apiError && (
          <Text size="xs" c="red" className="mb-2">
            {apiError}
          </Text>
        )}

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <Card
              key={p.id}
              withBorder
              shadow="sm"
              className="hover:shadow-md transition"
              onClick={() => setSelected(p)}
            >
              <Group justify="space-between" align="start">
                <Group gap="sm">
                  {p.photoUrl ? (
                    <Image
                      src={p.photoUrl}
                      alt={p.name}
                      radius="sm"
                      w={56}
                      h={56}
                      className="object-cover"
                    />
                  ) : (
                    <Avatar radius="sm" size={56} color="gray">
                      {p.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </Avatar>
                  )}
                  <div>
                    <Text fw={600}>{p.name}</Text>
                    <Group gap={6}>
                      <Badge variant="light">{p.category}</Badge>
                      {p.verified && (
                        <Badge
                          color="green"
                          variant="light"
                          leftSection={<IconCheck size={14} />}
                        >
                          Verified
                        </Badge>
                      )}
                    </Group>
                  </div>
                </Group>
                <div className="text-right">
                  <Rating value={p.rating} fractions={2} readOnly size="sm" />
                  <Group gap={4} className="justify-end mt-1">
                    <IconMessageCircle size={14} />
                    <Text size="xs" c="dimmed">
                      {p.reviews}
                    </Text>
                  </Group>
                </div>
              </Group>
              <Group gap="xs" className="mt-3">
                <Badge variant="outline">{p.charges}</Badge>
                <Group gap={6}>
                  <IconPhone size={14} />
                  <Text size="sm">{p.phone}</Text>
                </Group>
              </Group>
              <Text size="sm" c="dimmed" className="mt-2 line-clamp-2">
                {p.description}
              </Text>
            </Card>
          ))}
        </div>

        {/* Detail Modal */}
        <Modal
          opened={!!selected}
          onClose={() => setSelected(null)}
          title={<Text fw={600}>{selected?.name}</Text>}
          size="lg"
          centered
        >
          {selected && (
            <ScrollArea.Autosize mah={"70vh"} className="pr-1">
              <Group gap="md" align="start" className="mb-3">
                {selected.photoUrl ? (
                  <Image
                    src={selected.photoUrl}
                    alt={selected.name}
                    radius="md"
                    w={120}
                    h={120}
                    className="object-cover"
                  />
                ) : (
                  <Avatar radius="md" size={120} color="gray">
                    {selected.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </Avatar>
                )}
                <div className="flex-1">
                  <Group justify="space-between" align="start">
                    <Group gap={8}>
                      <Badge variant="light">{selected.category}</Badge>
                      {selected.verified && (
                        <Badge
                          color="green"
                          variant="light"
                          leftSection={<IconCheck size={14} />}
                        >
                          Verified
                        </Badge>
                      )}
                    </Group>
                    <div className="text-right">
                      <Rating value={selected.rating} fractions={2} readOnly />
                      <Group gap={6} className="justify-end mt-1">
                        <IconMessageCircle size={14} />
                        <Text size="xs" c="dimmed">
                          {selected.reviews} reviews
                        </Text>
                      </Group>
                    </div>
                  </Group>
                  <Group gap={10} className="mt-3">
                    <Badge variant="outline">{selected.charges}</Badge>
                    <Group gap={6}>
                      <IconPhone size={14} />
                      <Text size="sm">{selected.phone}</Text>
                    </Group>
                    <Group gap={6}>
                      <IconId size={14} />
                      <Text size="sm">{selected.id}</Text>
                    </Group>
                  </Group>
                  {selected.address && (
                    <Text size="sm" c="dimmed" className="mt-2">
                      {selected.address}
                    </Text>
                  )}
                </div>
              </Group>
              <Text size="sm">{selected.description}</Text>
              {typeof selected.experienceYears === "number" && (
                <Text size="sm" c="dimmed" className="mt-2">
                  Experience: {selected.experienceYears} years
                </Text>
              )}
            </ScrollArea.Autosize>
          )}
        </Modal>
      </div>

      <Modal
        opened={openNewJobModal}
        onClose={() => {
          reset();
          setOpenNewJobModal(false);
        }}
        title={<Text fw={600}>Add Helper</Text>}
        size="lg"
        centered
      >
        <form onSubmit={handleSubmit(onAddHelper)} className="space-y-3">
          <TextInput
            label="Name"
            placeholder="Enter helper name"
            withAsterisk
            {...register("name", { required: "Name is required" })}
          />
          {errors.name && (
            <Text size="xs" c="red">{errors.name.message}</Text>
          )}
          <TextInput
            label="Category"
            placeholder="e.g., Plumber, Electrician"
            withAsterisk
            {...register("category", { required: "Category is required" })}
          />
          {errors.category && (
            <Text size="xs" c="red">{errors.category.message as string}</Text>
          )}
          <Group grow>
            <TextInput
              label="Charges"
              placeholder="e.g., Rs 350 / visit"
              withAsterisk
              {...register("charges", { required: "Charges are required" })}
            />
            {errors.charges && (
              <Text size="xs" c="red">{errors.charges.message}</Text>
            )}
            <TextInput
              label="Phone"
              placeholder="e.g., +91 98765 43210"
              withAsterisk
              {...register("phone", {
                required: "Phone is required",
                validate: (val) => {
                  const digits = (val || "").replace(/\D/g, "");
                  return (
                    (digits.length >= 10 && digits.length <= 13) ||
                    "Enter a valid phone number"
                  );
                },
              })}
            />
            {errors.phone && (
              <Text size="xs" c="red">{errors.phone.message}</Text>
            )}
          </Group>
          <Group grow>
            <NumberInput
              label="Rating"
              min={0}
              max={5}
              step={0.1}
              {...register("rating")}
            />
            <NumberInput label="Reviews" min={0} {...register("reviews")} />
            <NumberInput
              label="Experience (years)"
              min={0}
              {...register("experienceYears")}
            />
          </Group>
          <TextInput
            label="Address"
            placeholder="Area, City"
            {...register("address")}
          />
          <TextInput
            label="Photo URL"
            placeholder="https://..."
            {...register("photoUrl")}
          />
          <TextInput
            label="Description"
            placeholder="Short details about the service"
            withAsterisk
            {...register("description", {
              required: "Description is required",
            })}
          />
          {errors.description && (
            <Text size="xs" c="red">{errors.description.message}</Text>
          )}
          <Group justify="flex-end" mt="sm">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                setOpenNewJobModal(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid}>
              Add Helper
            </Button>
          </Group>
        </form>
      </Modal>
    </>
  );
};

export default TerritoryBlueCollarJobPage;
