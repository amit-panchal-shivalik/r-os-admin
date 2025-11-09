import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { Paper, Modal, Text, Badge } from "@mantine/core";
import { useForm, Controller } from "react-hook-form";
import { notifications } from "@mantine/notifications";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import MapPicker from "@/components/maps/MapPicker";
import MapView from "@/components/maps/MapView";
import { MarkerF as Marker } from "@react-google-maps/api";
import { fetchTerritoryProjects } from "@/apis/territoryService";
import { publishProject } from "@/apis/projectService";
import {
  CreateProjectPayload,
  ProjectSummary,
  ProjectStatus,
} from "@/types/ApiTypes";
import { DEFAULT_TERRITORY_ID } from "@/utils/Constant";
import { useTerritorySelection } from "@/context/TerritoryContext";
import { Carousel } from "@mantine/carousel";
import { Image } from "@mantine/core";
import "@mantine/carousel/styles.css";

export const TerritoryProjectsPage = () => {
  const [openNewProjectModal, setOpenNewProjectModal] = useState(false);
  const { user } = useAuth();
  const storedUserInfo = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("userInfo") || "{}");
    } catch {
      return {};
    }
  }, []);

  const defaultDevName = useMemo(() => {
    const first = storedUserInfo?.firstName;
    const last = storedUserInfo?.lastName;
    const full = [first, last].filter(Boolean).join(" ");
    return (full || user?.name || "").trim();
  }, [storedUserInfo, user]);

  const { selectedTerritory, territories } = useTerritorySelection();
  const territoryId = selectedTerritory?.id || DEFAULT_TERRITORY_ID;
  const { canCreate } = usePermissions();
  const allowCreate = canCreate("project");

  type FormValues = {
    projectName: string;
    territoryId: string;
    status: "Under Construction" | "Ready" | "Possession Soon" | "";
    developerName: string;
    priceRangeMin?: number;
    priceRangeMax?: number;
    configurations: string[];
    brochureUpload: File | null;
    location: { lat: number; lng: number } | null;
  };

  type ProjectItem = {
    id: string;
    projectName: string;
    territoryId: string;
    territoryLabel: string;
    status: "Under Construction" | "Ready" | "Possession Soon";
    developerName: string;
    priceRangeMin?: number;
    priceRangeMax?: number;
    priceRangeLabel?: string;
    configurations: string[];
    brochureName?: string;
    location?: { lat: number; lng: number };
  };

  const statusColor: Record<ProjectItem["status"], string> = {
    "Under Construction": "yellow",
    Ready: "green",
    "Possession Soon": "orange",
  };

  const fallbackTerritoryOptions = useMemo(
    () => [
      { value: "t1", label: "North Territory" },
      { value: "t2", label: "South Territory" },
      { value: "t3", label: "East Territory" },
      { value: "t4", label: "West Territory" },
    ],
    []
  );

  const territoryOptions = useMemo(
    () =>
      territories.length
        ? territories.map((t) => ({ value: t.id, label: t.name }))
        : fallbackTerritoryOptions,
    [territories, fallbackTerritoryOptions]
  );

  const getTerritoryLabel = (id: string) =>
    territoryOptions.find((t) => t.value === id)?.label || "Primary Territory";

  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const dummyProjects: ProjectItem[] = useMemo(() => {
    const label = (id: string) =>
      [
        { value: "t1", label: "North Territory" },
        { value: "t2", label: "South Territory" },
        { value: "t3", label: "East Territory" },
        { value: "t4", label: "West Territory" },
      ].find((t) => t.value === id)?.label || id;
    return [
      {
        id: "p1",
        projectName: "Emerald Heights",
        territoryId: "t1",
        territoryLabel: label("t1"),
        status: "Under Construction",
        developerName: "Shivam Group",
        priceRangeMin: "₹ 45 Lacs",
        priceRangeMax: "₹ 95 Lacs",
        configurations: ["2BHK", "3BHK", "Penthouse"],
        brochureName: "emerald-heights.pdf",
        location: { lat: 23.0396, lng: 72.566 },
        address: "Judges Bungalow Road, Vastrapur, Ahmedabad",
      },
      {
        id: "p2",
        projectName: "Riverside Residency",
        territoryId: "t2",
        territoryLabel: label("t2"),
        status: "Ready",
        developerName: "Green Field",
        priceRangeMin: "₹ 35 Lacs",
        priceRangeMax: "₹ 70 Lacs",
        configurations: ["1BHK", "2BHK"],
        brochureName: "riverside-residency.pdf",
        location: { lat: 23.0705, lng: 72.5803 },
        address: "Sindhu Bhavan Road, Thaltej, Ahmedabad",
      },
      {
        id: "p3",
        projectName: "Sunset Meadows",
        territoryId: "t3",
        territoryLabel: label("t3"),
        status: "Possession Soon",
        developerName: "Shayona Group",
        priceRangeMin: "₹ 55 Lacs",
        priceRangeMax: "₹ 1.20 Cr",
        configurations: ["3BHK", "Penthouse", "Plot"],
        brochureName: "sunset-meadows.pdf",
        location: { lat: 23.012, lng: 72.5105 },
        address: "Near Shyamal Cross Road, Prahlad Nagar, Ahmedabad",
      },
      {
        id: "p4",
        projectName: "Skyline Vista",
        territoryId: "t4",
        territoryLabel: label("t4"),
        status: "Under Construction",
        developerName: "SkyBuild Pvt Ltd",
        priceRangeMin: "₹ 60 Lacs",
        priceRangeMax: "₹ 1.40 Cr",
        configurations: ["2BHK", "3BHK"],
        brochureName: "skyline-vista.pdf",
        location: { lat: 23.045, lng: 72.59 },
        address: "Drive-In Road, Memnagar, Ahmedabad",
      },
      {
        id: "p5",
        projectName: "Lakeview Enclave",
        territoryId: "t1",
        territoryLabel: label("t1"),
        status: "Ready",
        developerName: "Lakeview Group",
        priceRangeMin: 75,
        priceRangeMax: 160,
        configurations: ["Villa", "Plot"],
        brochureName: "lakeview-enclave.pdf",
        location: { lat: 23.02, lng: 72.57 },
        address: "Jodhpur Cross Road, Satellite, Ahmedabad",
      },
      {
        id: "p6",
        projectName: "Green Meadows",
        territoryId: "t2",
        territoryLabel: label("t2"),
        status: "Possession Soon",
        developerName: "Green Infra",
        priceRangeMin: 40,
        priceRangeMax: 90,
        configurations: ["1BHK", "2BHK", "3BHK"],
        brochureName: "green-meadows.pdf",
        location: { lat: 23.06, lng: 72.54 },
        address: "Sola Road, Ghatlodia, Ahmedabad",
      },
    ];
  }, [defaultDevName]);

  useEffect(() => {
    if (!projects.length) {
      setProjects(dummyProjects);
    }
  }, [dummyProjects, projects.length]);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(
    null
  );
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const formatPriceLabel = (min?: number, max?: number) => {
    const parts: string[] = [];
    if (typeof min === "number") parts.push(`₹ ${min}`);
    if (typeof max === "number") parts.push(`₹ ${max}`);
    return parts.length ? parts.join(" – ") : undefined;
  };

  const mapProjectSummary = (
    summary: ProjectSummary,
    territoryIdForSummary: string
  ): ProjectItem => {
    const configs =
      summary.configuration
        ?.split(",")
        .map((item) => item.trim())
        .filter(Boolean) ?? [];
    const territoryId = territoryIdForSummary || DEFAULT_TERRITORY_ID;
    return {
      id:
        summary.project_id ||
        `${(summary.name ?? "project")
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "")}-${Date.now()}`,
      projectName: summary.name || "Untitled Project",
      territoryId,
      territoryLabel: getTerritoryLabel(territoryId),
      status: (summary.status as ProjectItem["status"]) || "Under Construction",
      developerName:
        summary.developer_name || defaultDevName || "Shivalik Group",
      priceRangeLabel: summary.price_range,
      configurations: configs,
      brochureName: summary.brochure_url,
    };
  };

  useEffect(() => {
    if (!territoryId) return;
    setLoadingProjects(true);
    fetchTerritoryProjects(territoryId)
      .then((resp) => {
        const mapped = resp.projects.map((summary) =>
          mapProjectSummary(summary, territoryId)
        );
        setProjects(mapped);
        setFetchError(null);
      })
      .catch((error: any) => {
        if (error?.status === 404) {
          // No projects for this territory yet: show empty state without error banner
          setProjects([]);
          setFetchError(null);
        } else {
          setFetchError(error?.message || "Unable to load projects.");
          setProjects([]);
        }
      })
      .finally(() => setLoadingProjects(false));
  }, [territoryId]);

  const {
    control,
    register,
    handleSubmit,
    setError,
    reset,
    getValues,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    defaultValues: {
      projectName: "",
      territoryId: "",
      status: "",
      developerName: defaultDevName,
      priceRangeMin: undefined,
      priceRangeMax: undefined,
      configurations: [],
      brochureUpload: null,
      location: null,
    },
    mode: "onChange",
  });

  const onSubmit = (data: FormValues) => {
    if (!allowCreate) return;
    if (
      typeof data.priceRangeMin === "number" &&
      typeof data.priceRangeMax === "number" &&
      data.priceRangeMax < data.priceRangeMin
    ) {
      setError("priceRangeMax", {
        type: "validate",
        message: "Max price must be greater than or equal to min price",
      });
      return;
    }

    const priceRangeLabel = formatPriceLabel(
      data.priceRangeMin,
      data.priceRangeMax
    );

    const payload: CreateProjectPayload = {
      territory_id: data.territoryId || territoryId,
      name: data.projectName,
      status: data.status as ProjectStatus,
      price_range: priceRangeLabel || "Pending",
      configuration: data.configurations.join(", "),
      brochure_url: data.brochureUpload?.name || "",
      developer_name: data.developerName,
      location: data.location || undefined,
    };

    setIsPublishing(true);
    publishProject(payload)
      .then((resp) => {
        const territoryLabel =
          territoryOptions.find((t) => t.value === data.territoryId)?.label ||
          "Primary Territory";
        const newItem: ProjectItem = {
          id: `${Date.now()}`,
          projectName: data.projectName,
          territoryId: data.territoryId,
          territoryLabel,
          status: (data.status ||
            "Under Construction") as ProjectItem["status"],
          developerName: data.developerName,
          priceRangeMin: data.priceRangeMin,
          priceRangeMax: data.priceRangeMax,
          priceRangeLabel,
          configurations: data.configurations,
          brochureName: data.brochureUpload?.name,
          location: data.location || undefined,
        };
        setProjects((prev) => [newItem, ...prev]);
        notifications.show({
          title: "Project submitted",
          message:
            resp.verification_status ||
            `${data.projectName} has been added successfully`,
        });
        handleCloseModal();
      })
      .catch((error: any) => {
        notifications.show({
          color: "red",
          title: "Failed to publish project",
          message:
            error?.message ||
            "Unable to submit the project right now. Please try again later.",
        });
      })
      .finally(() => setIsPublishing(false));
  };

  const handleOpenAddNewProject = () => {
    if (!allowCreate) return;
    setSelectedProject(null);
    reset();
    setOpenNewProjectModal(true);
  };

  const handleCloseModal = () => {
    setIsPublishing(false);
    reset();
    setOpenNewProjectModal(false);
  };

  return (
    <>
      <div className="mt-5">
        <div className="flex items-start justify-between gap-2 flex-col sm:flex-row">
          <PageHeader
            title="Territory Projects"
            description="Manage territory projects"
          />
          {allowCreate && (
            <Button
              onClick={handleOpenAddNewProject}
              className="h-9 px-3 text-xs sm:h-10 sm:px-4 sm:text-sm"
            >
              <Icon icon="fa:plus" />
              Add New Project
            </Button>
          )}
        </div>

        <Paper p="md">
          {fetchError && (
            <Text c="red" size="xs" mb="sm">
              {fetchError}
            </Text>
          )}

          {loadingProjects ? (
            <Text c="dimmed" size="sm">
              Loading projects...
            </Text>
          ) : projects.length === 0 ? (
            <Text c="dimmed" size="sm">
              No projects yet. Use "Add New Project" to create one.
            </Text>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {projects.map((p) => (
                <div
                  key={p.id}
                  className="border rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                  onClick={() => {
                    setSelectedProject(p);
                    setOpenNewProjectModal(false);
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Text fw={600}>{p.projectName}</Text>
                    <Badge variant="light" color={statusColor[p.status]}>
                      {p.status}
                    </Badge>
                  </div>
                  <Text size="sm" c="dimmed">
                    {p.territoryLabel}
                  </Text>
                  <div className="mt-2 space-y-1">
                    <Text size="sm">
                      Developer:{" "}
                      <span className="font-medium">{p.developerName}</span>
                    </Text>
                    <Text size="sm">
                      Price:{" "}
                      {p.priceRangeLabel ??
                        `${p.priceRangeMin ?? "-"} – ${p.priceRangeMax ?? "-"}`}
                    </Text>
                    {p.brochureName && (
                      <Text size="sm">
                        Brochure:{" "}
                        <span className="font-medium">{p.brochureName}</span>
                      </Text>
                    )}
                    {p.address && <Text size="sm">Address : {p.address}</Text>}
                  </div>
                  {p.configurations.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {p.configurations.map((cfg) => (
                        <Badge key={cfg} variant="outline">
                          {cfg}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProject(p);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Paper>
      </div>

      {/* ---------- Add New Project Modal ---------- */}
      <Modal
        key="add-project-modal"
        opened={openNewProjectModal}
        onClose={handleCloseModal}
        title={<h2 className="text-lg font-semibold">Add New Project</h2>}
        centered
        size="lg"
      >
        <div className="no-scrollbar max-h-[75vh] overflow-y-auto pr-1">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Project Name */}
            <div>
              <Text fw={600} size="sm">
                Project Name <span className="text-red-500">*</span>
              </Text>
              <input
                type="text"
                {...register("projectName", {
                  required: "Project name is required",
                })}
                placeholder="Enter project name"
                className="w-full border rounded-md px-3 py-2 mt-1 text-sm  outline-none"
              />
              {errors.projectName && (
                <Text size="xs" c="red">
                  {errors.projectName.message}
                </Text>
              )}
            </div>

            {/* Territory */}
            <div>
              <Text fw={600} size="sm">
                Territory <span className="text-red-500">*</span>
              </Text>
              <Controller
                control={control}
                name="territoryId"
                rules={{ required: "Territory is required" }}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full border rounded-md px-3 py-2 mt-1 text-sm  outline-none"
                  >
                    <option value="">Select Territory</option>
                    {territoryOptions.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.territoryId && (
                <Text size="xs" c="red">
                  {errors.territoryId.message}
                </Text>
              )}
            </div>

            {/* Status */}
            <div>
              <Text fw={600} size="sm">
                Status <span className="text-red-500">*</span>
              </Text>
              <Controller
                control={control}
                name="status"
                rules={{ required: "Status is required" }}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full border rounded-md px-3 py-2 mt-1 text-sm  outline-none"
                  >
                    <option value="">Select Status</option>
                    <option value="Under Construction">
                      Under Construction
                    </option>
                    <option value="Ready">Ready</option>
                    <option value="Possession Soon">Possession Soon</option>
                  </select>
                )}
              />
              {errors.status && (
                <Text size="xs" c="red">
                  {errors.status.message}
                </Text>
              )}
            </div>

            {/* Developer Name */}
            <div>
              <Text fw={600} size="sm">
                Developer Name <span className="text-red-500">*</span>
              </Text>
              <input
                type="text"
                {...register("developerName", {
                  required: "Developer name is required",
                })}
                placeholder="Enter developer name"
                defaultValue={defaultDevName}
                className="w-full border rounded-md px-3 py-2 mt-1 text-sm  outline-none"
              />
              {errors.developerName && (
                <Text size="xs" c="red">
                  {errors.developerName.message}
                </Text>
              )}
            </div>

            {/* Price Range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Text fw={600} size="sm">
                  Min Price <span className="text-red-500">*</span>
                </Text>
                <input
                  type="number"
                  {...register("priceRangeMin", {
                    required: "Min price is required",
                    min: 0,
                  })}
                  placeholder="0"
                  className="w-full border rounded-md px-3 py-2 mt-1 text-sm  outline-none"
                />
                {errors.priceRangeMin && (
                  <Text size="xs" c="red">
                    {errors.priceRangeMin.message}
                  </Text>
                )}
              </div>

              <div>
                <Text fw={600} size="sm">
                  Max Price <span className="text-red-500">*</span>
                </Text>
                <input
                  type="number"
                  {...register("priceRangeMax", {
                    required: "Max price is required",
                    validate: (value) =>
                      value >= getValues("priceRangeMin") ||
                      "Max must be ≥ Min price",
                  })}
                  placeholder="0"
                  className="w-full border rounded-md px-3 py-2 mt-1 text-sm  outline-none"
                />
                {errors.priceRangeMax && (
                  <Text size="xs" c="red">
                    {errors.priceRangeMax.message}
                  </Text>
                )}
              </div>
            </div>

            {/* Configurations */}
            {/* Configurations */}
            <div>
              <Text fw={600} size="sm">
                Configurations <span className="text-red-500">*</span>
              </Text>
              <div className="flex flex-wrap gap-4 mt-1">
                {["1BHK", "2BHK", "3BHK", "Penthouse", "Plot"].map((cfg) => (
                  <label key={cfg} className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      value={cfg}
                      {...register("configurations", {
                        required: "Please select one configuration",
                      })}
                      className="accent-blue-600"
                    />
                    {cfg}
                  </label>
                ))}
              </div>
              {errors.configurations && (
                <Text size="xs" c="red">
                  {errors.configurations.message as string}
                </Text>
              )}
            </div>

            {/* Brochure Upload (Optional) */}
            <div>
              <Text fw={600} size="sm">
                Brochure (PDF)
              </Text>
              <Controller
                control={control}
                name="brochureUpload"
                render={({ field }) => (
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) =>
                      field.onChange(e.target.files?.[0] || null)
                    }
                    className="mt-1 w-full text-sm border rounded-md px-2 py-1 cursor-pointer bg-white"
                  />
                )}
              />
            </div>

            {/* Photo Upload (Optional) */}
            <div>
              <Text fw={600} size="sm">
                Project Photos
              </Text>
              <input
                type="file"
                accept="image/*"
                multiple
                className="mt-1 w-full text-sm border rounded-md px-2 py-1 cursor-pointer bg-white"
              />
            </div>

            {/* Video Upload (Optional) */}
            <div>
              <Text fw={600} size="sm">
                Project Video
              </Text>
              <input
                type="file"
                accept="video/*"
                className="mt-1 w-full text-sm border rounded-md px-2 py-1 cursor-pointer bg-white"
              />
            </div>

            {/* Map Location */}
            <div>
              <Text fw={600} size="sm">
                Location (Pin on Map) <span className="text-red-500">*</span>
              </Text>
              <Controller
                control={control}
                name="location"
                rules={{ required: "Location is required" }}
                render={({ field }) => (
                  <MapPicker
                    label="Select Project Location"
                    required
                    value={field.value}
                    onChange={(v) => field.onChange(v)}
                    error={errors.location?.message as string}
                    height={250}
                  />
                )}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                color="gray"
                onClick={handleCloseModal}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!isValid || isPublishing}
                // loading={isPublishing}
              >
                Add Project
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* ---------- View Project Modal ---------- */}
      <Modal
        key={selectedProject?.id || "view-project-modal"}
        opened={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        size="xl"
        centered
        padding="md"
        title={
          selectedProject && (
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between w-full gap-2">
              {/* LEFT: Name + location */}
              <div>
                <Text fw={700} size="xl" c="#111827" className="leading-tight">
                  {selectedProject.projectName}
                </Text>
                <div className="flex items-center gap-1 mt-1 text-gray-500">
                  <Icon icon="mdi:map-marker-outline" width={16} />
                  <Text size="sm" c="dimmed">
                    {selectedProject.territoryLabel}
                  </Text>
                </div>
              </div>

              {/* RIGHT: Soft Badge + Brochure */}
              <div className="flex items-center gap-3">
                {selectedProject.brochureName && (
                  <Button
                    variant="light"
                    color="blue"
                    size="xs"
                    radius="xl"
                    onClick={() =>
                      window.open(
                        "/assets/dummy-brochure.pdf", // dummy brochure file
                        "_blank"
                      )
                    }
                  >
                    <Icon icon="mdi:file-download-outline" width={16} />
                    &nbsp;Download Brochure
                  </Button>
                )}

                <Badge
                  variant="dot"
                  color={
                    selectedProject.status === "Ready"
                      ? "green"
                      : selectedProject.status === "Under Construction"
                      ? "yellow"
                      : "blue"
                  }
                  size="lg"
                  radius="xl"
                  fw={600}
                  className="px-4 py-[6px] text-[13px] shadow-sm"
                >
                  {selectedProject.status}
                </Badge>
              </div>
            </div>
          )
        }
      >
        {selectedProject && (
          <div className="no-scrollbar max-h-[75vh] overflow-y-auto pr-1 space-y-5">
            {/* 🖼 Gallery Section */}
            <Paper
              shadow="sm"
              radius="md"
              p="sm"
              className="bg-white border border-gray-200"
            >
              <Carousel
                withIndicators
                loop
                slideSize="50%"
                height={280}
                align="start"
                slideGap="md"
              >
                <Carousel.Slide>
                  <Image
                    src="https://images.unsplash.com/photo-1505691938895-1758d7feb511"
                    height={280}
                    fit="cover"
                    radius="md"
                    alt="Project image 1"
                  />
                </Carousel.Slide>
                <Carousel.Slide>
                  <Image
                    src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c"
                    height={280}
                    fit="cover"
                    radius="md"
                    alt="Project image 2"
                  />
                </Carousel.Slide>
                <Carousel.Slide>
                  <video
                    src="https://www.w3schools.com/html/mov_bbb.mp4"
                    controls
                    className="rounded-md w-full h-[280px] object-cover"
                  />
                </Carousel.Slide>
              </Carousel>
            </Paper>

            {/* 🏢 Project Info Section */}
            <Paper
              shadow="xs"
              radius="md"
              p="lg"
              className="bg-gradient-to-r from-gray-50 via-white to-gray-50 border"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left */}
                <div className="space-y-3">
                  <div>
                    <Text fw={600} size="sm" c="#374151">
                      Developer
                    </Text>
                    <Text size="sm" fw={500}>
                      {selectedProject.developerName}
                    </Text>
                  </div>

                  <div>
                    <Text fw={600} size="sm" c="#374151">
                      Price Range
                    </Text>
                    <Text size="sm" fw={500}>
                      ₹ {selectedProject.priceRangeMin ?? "-"} – ₹{" "}
                      {selectedProject.priceRangeMax ?? "-"}
                    </Text>
                  </div>

                  {selectedProject.configurations?.length > 0 && (
                    <div>
                      <Text fw={600} size="sm" c="#374151" mb={5}>
                        Configurations
                      </Text>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.configurations.map((cfg) => (
                          <Badge
                            key={cfg}
                            variant="light"
                            color="blue"
                            radius="sm"
                            size="sm"
                          >
                            {cfg}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Map */}
                <div>
                  <Text fw={600} size="sm" c="#374151" mb={5}>
                    Location
                  </Text>
                  {selectedProject.location ? (
                    <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                      <MapView
                        center={selectedProject.location}
                        zoom={15}
                        heightClassName="h-[240px]"
                      >
                        <Marker position={selectedProject.location} />
                      </MapView>
                      <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50 border-t">
                        <Icon
                          icon="mdi:crosshairs-gps"
                          className="inline mr-1 text-gray-500"
                        />
                        {selectedProject.location.lat.toFixed(5)},{" "}
                        {selectedProject.location.lng.toFixed(5)}
                      </div>
                    </div>
                  ) : (
                    <Text size="sm" c="dimmed">
                      Not specified
                    </Text>
                  )}
                </div>
              </div>
            </Paper>

            {/* 🌟 Project Highlights */}
            <Paper
              radius="md"
              p="md"
              className="bg-gradient-to-r from-white to-gray-50 border border-gray-200"
            >
              <Text fw={600} size="sm" c="#374151" mb="xs">
                Project Highlights
              </Text>
              <ul className="list-disc ml-5 text-sm text-gray-600 leading-relaxed space-y-1">
                <li>Located at a premium neighborhood near major landmarks</li>
                <li>Spacious homes with modern interiors</li>
                <li>
                  High-quality construction by {selectedProject.developerName}
                </li>
                <li>
                  Configurations available:{" "}
                  {selectedProject.configurations.join(", ")}
                </li>
              </ul>
            </Paper>
          </div>
        )}
      </Modal>
    </>
  );
};

export default TerritoryProjectsPage;
