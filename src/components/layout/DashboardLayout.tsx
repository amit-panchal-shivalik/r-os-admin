import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  AppShell,
  Text,
  Group,
  Avatar,
  Menu,
  UnstyledButton,
  Box,
  Burger,
  rem,
  Divider,
  Modal,
  Select,
  Loader,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconUsers,
  IconMapPin,
  IconChartBar,
  IconBook,
  IconLogout,
  IconCaretDown,
  IconDeviceDesktop,
  IconSpeakerphone,
  IconCalendar,
  IconMessageCircle2,
  IconTrendingUp,
} from "@tabler/icons-react";
import { useAuth } from "../../hooks/useAuth";
import { Users2 } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { useTerritorySelection } from "@/context/TerritoryContext";
import {
  capitalizeFirstLetter,
  getUserRoleLabel,
} from "@/utils/HelperFunctions";
import AsyncSelect from "react-select/async";

/* --------------------- NAVIGATION --------------------- */
const navigation = [
  { name: "People", href: "/users", icon: IconUsers },
  {
    name: "Territory",
    href: "/territory",
    icon: IconMapPin,
    subItems: [
      { name: "Dashboard", href: "/territory/dashboard" },
      { name: "Projects", href: "/territory/project" },
      // { name: "Land", href: "/territory/land" },
      { name: "Vendors", href: "/territory/vendor" },
      // { name: "Store", href: "/territory/store" },
      // { name: "Institute", href: "/territory/institute" },
      // { name: "Society Admin", href: "/territory/society-admin" },
      { name: "Opportunity", href: "/territory/opportunity" },
      { name: "Blue Collar Job", href: "/territory/blue-collar-job" },
      // { name: "Events", href: "/territory/event" },
    ],
  },
  { name: "Desk", href: "/follow-up", icon: IconDeviceDesktop },
  { name: "Event", href: "/event", icon: IconCalendar },
  { name: "Knowledge", href: "/article-listing", icon: IconBook },
  { name: "Channel Sales", href: "/channel-sales", icon: IconChartBar },
  {
    name: "Campaign",
    href: "/campaign-list",
    icon: IconSpeakerphone,
    subItems: [
      { name: "Campaign", href: "/campaign-list" },
      { name: "Add Campaign", href: "/campaign-add" },
    ],
  },
  {
    name: "Employee",
    href: "/employee/dashboard",
    icon: Users2,
    subItems: [
      { name: "Dashboard", href: "/employee/dashboard" },
      { name: "Employee List", href: "/employee/employee-list" },
      { name: "Designation", href: "/employee/designation" },
      { name: "Department", href: "/employee/department" },
      { name: "Branch", href: "/employee/branch" },
      { name: "Seating Office", href: "/employee/seating-office" },
      { name: "Shift Management", href: "/employee/shift-management" },
      { name: "Jobs", href: "/employee/jobs" },
      { name: "Report", href: "/employee/report" },
    ],
  },
  {
    name: "Feedback",
    href: "/feedback-list",
    icon: IconMessageCircle2,
    subItems: [
      { name: "Feedback Modules", href: "/feedback-modules-list" },
      { name: "Feedback List", href: "/feedback-list" },
    ],
  },
  {
    name: "Growth Partner",
    href: "/growth-partner-list",
    icon: IconTrendingUp,
  },
];

/* --------------------- ROLE → TABS --------------------- */
const roleToTabs: Record<string, string[]> = {
  SuperAdmin: navigation.map((i) => i.name),
  LandManager: ["Desk", "Territory"],
  LandExecutive: ["Desk", "Territory"],
  FundManager: ["Desk"],
  FundExecutive: ["Desk"],
  ProjectSalesManager: ["Desk"],
  ProjectPreSales: ["Desk"],
  ProjectSiteSales: ["Desk"],
  EventAdmin: ["Event"],
  KnowledgeAdmin: ["Knowledge"],
  CPManager: ["Desk", "Channel Sales"],
  CPExecutive: ["Desk", "Channel Sales"],
  CampaignAdmin: ["Campaign"],
  VendorAdmin: ["Territory"],
  HRManager: ["Employee"],
  HRExecutive: ["Employee"],
  CSWebsiteAdmin: ["Desk"],
  FurnitureManager: ["Desk", "Territory"],
  FurnitureSalesExecutive: ["Desk", "Territory"],
  FurnitureB2BAdmin: ["Desk", "Territory"],
  FurnitureDealerAdmin: ["Desk", "Territory"],
  GrowthPartnerAdmin: ["Growth Partner"],
  InstituteManager: ["Desk"],
  InstituteExecutive: ["Desk"],
};

const getFilteredNavigation = (roles: string[] = []) => {
  if (roles.includes("registered_user")) return navigation;

  const allowed = new Set<string>();
  const landRestricted = roles?.some((r) =>
    ["LandManager", "LandExecutive"].includes(r)
  );
  const furnitureRestricted = roles?.some((r) =>
    [
      "FurnitureManager",
      "FurnitureSalesExecutive",
      "FurnitureB2BAdmin",
      "FurnitureDealerAdmin",
    ].includes(r)
  );
  const vendorRestricted = roles.includes("VendorAdmin");

  roles?.forEach((role) => roleToTabs[role]?.forEach((t) => allowed.add(t)));

  // Fallback: if no explicit permissions resolved for these roles,
  // show full navigation so the sidebar is approachable for all user types
  if (allowed.size === 0) {
    return navigation;
  }

  return navigation
    .filter((item) => {
      if (item.name === "Feedback") return true;
      return allowed.has(item.name);
    })
    .map((item) => {
      if (item.name === "Territory") {
        const subItems: { name: string; href: string }[] = [];
        if (landRestricted)
          subItems.push({ name: "Land", href: "/territory/land/dashboard" });
        if (furnitureRestricted)
          subItems.push({ name: "Store", href: "/territory/store/dashboard" });
        if (vendorRestricted) {
          subItems.push(
            { name: "Dashboard", href: "/territory/dashboard" },
            { name: "Vendors", href: "/territory/vendor/dashboard" }
          );
        }
        if (subItems.length) return { ...item, subItems };
      }
      if (item.name === "Feedback") {
        return {
          ...item,
          subItems: item.subItems?.filter((s) => s.name !== "Feedback Modules"),
        };
      }
      return item;
    });
};

/* --------------------- LAYOUT --------------------- */
export const DashboardLayout = () => {
  const [opened, { toggle, close }] = useDisclosure();
  const { user, profile, logout }: any = useAuth();
  const {
    territories,
    selectedTerritory,
    selectTerritory,
    loading: territoriesLoading,
    error: territoryError,
  } = useTerritorySelection();
  const navigate = useNavigate();
  const location = useLocation();
  const [activePath, setActivePath] = useState(
    () => localStorage.getItem("lastActivePath") || "/users"
  );
  const [tabOpenStates, setTabOpenStates] = useState<Record<string, boolean>>(
    () => {
      try {
        return JSON.parse(localStorage.getItem("tabOpenStates") || "{}");
      } catch {
        return navigation.reduce(
          (acc, item) => (item.subItems ? { ...acc, [item.href]: false } : acc),
          {} as Record<string, boolean>
        );
      }
    }
  );
  const [logoutModal, setLogoutModal] = useState(false);
  const isInitialMount = useRef(true);

  // user info / roles
  let userInfo: any = {};
  try {
    userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  } catch {}
  const storedRoles: string[] = Array.isArray(userInfo.userRoles)
    ? userInfo.userRoles
    : Array.isArray(userInfo.roles)
    ? userInfo.roles
    : [];
  const derivedRoles: string[] = user?.userRoles?.length
    ? user.userRoles
    : user?.role
    ? user.role
        .split(",")
        .map((r: string) => r.trim())
        .filter(Boolean)
    : [];
  const effectiveRoles =
    profile?.roles?.length && profile.roles.length
      ? profile.roles
      : derivedRoles.length
      ? derivedRoles
      : storedRoles;

  const fallbackFullName: string = userInfo?.full_name || "";
  const fallbackNameParts = fallbackFullName
    .split(" ")
    .map((part: string) => part.trim())
    .filter(Boolean);
  const fallbackFirstName =
    userInfo?.firstName ||
    fallbackNameParts[0] ||
    user?.name?.split(" ").find(Boolean) ||
    "";
  const fallbackLastName =
    userInfo?.lastName ||
    fallbackNameParts.slice(1).join(" ") ||
    user?.name?.split(" ").slice(1).join(" ") ||
    "";
  const displayFirstName = user?.firstName || fallbackFirstName || "User";
  const displayLastName = user?.lastName || fallbackLastName || "";
  const displayMobile =
    profile?.mobile_number ||
    user?.phone ||
    userInfo?.mobile_number ||
    userInfo?.phone ||
    "";
  const territorySelectData = useMemo(
    () =>
      territories.map((t) => ({
        label: t.name,
        value: t.id,
        search:
          (t.feature?.properties as any)?.pin_code ||
          (t.feature?.properties as any)?.pincode ||
          ""
            ? `${t.name} ${
                (t.feature?.properties as any)?.pin_code ||
                (t.feature?.properties as any)?.pincode ||
                ""
              }`
            : t.name,
      })),
    [territories]
  );

  // Async select helpers for searching by name or pin code
  const [inputValue, setInputValue] = useState("");
  const fetchTerritoryOptions = (input: string) => {
    const q = (input || "").trim().toLowerCase();
    const base = territorySelectData;
    if (!q)
      return Promise.resolve([
        { label: "All Territories", value: "ALL" },
        ...base,
      ]);
    const filtered = base.filter((opt: any) =>
      `${opt.label} ${opt.search || ""}`.toLowerCase().includes(q)
    );
    const includeAll = "all".includes(q) || "all territories".includes(q);
    return Promise.resolve(
      includeAll
        ? [{ label: "All Territories", value: "ALL" }, ...filtered]
        : filtered
    );
  };
  const filteredNavigation = getFilteredNavigation(effectiveRoles);

  useEffect(() => {
    if (isInitialMount.current) {
      const storedPath = localStorage.getItem("lastActivePath");
      const isValidPath = filteredNavigation.some(
        (item) =>
          item.href === storedPath ||
          item.subItems?.some((sub) => sub.href === storedPath)
      );
      if (storedPath && isValidPath && storedPath !== location.pathname) {
        navigate(storedPath, { replace: true });
      } else if (!isValidPath && storedPath) {
        localStorage.setItem("lastActivePath", "/users");
        navigate("/users", { replace: true });
      }
      isInitialMount.current = false;
    }
  }, [navigate, filteredNavigation]);

  useEffect(() => {
    if (activePath !== location.pathname) {
      setActivePath(location.pathname);
      localStorage.setItem("lastActivePath", location.pathname);
    }

    const updated = { ...tabOpenStates };
    let changed = false;
    filteredNavigation.forEach((item) => {
      if (item.subItems) {
        const isSubActive = item.subItems.some(
          (s) => location.pathname === s.href
        );
        const isParentActive = location.pathname === item.href;
        const shouldOpen = isSubActive || isParentActive;
        if (updated[item.href] !== shouldOpen) {
          updated[item.href] = shouldOpen;
          changed = true;
        }
      }
    });
    if (changed) {
      setTabOpenStates(updated);
      localStorage.setItem("tabOpenStates", JSON.stringify(updated));
    }
  }, [location.pathname, activePath, filteredNavigation]);

  const handleLogout = () => {
    logout();
    localStorage.removeItem("lastActivePath");
    localStorage.removeItem("tabOpenStates");
    navigate("/login");
  };

  const handleTabClick = (item: (typeof navigation)[0]) => {
    if (item.subItems) {
      setTabOpenStates((prev) => {
        const open = !!prev[item.href];
        const next = { ...prev, [item.href]: !open };
        localStorage.setItem("tabOpenStates", JSON.stringify(next));
        if (!open && item.subItems?.length) {
          const target = item.subItems[0].href;
          if (location.pathname !== target) {
            navigate(target);
            setActivePath(target);
            localStorage.setItem("lastActivePath", target);
          }
        }
        return next;
      });
    } else {
      navigate(item.href);
      setActivePath(item.href);
      localStorage.setItem("lastActivePath", item.href);
      close();
    }
  };

  const handleSubItemClick = (href: string) => {
    navigate(href);
    setActivePath(href);
    localStorage.setItem("lastActivePath", href);
    const parent = filteredNavigation.find((i) =>
      i.subItems?.some((s) => s.href === href)
    );
    if (parent) {
      setTabOpenStates((prev) => {
        const next = { ...prev, [parent.href]: true };
        localStorage.setItem("tabOpenStates", JSON.stringify(next));
        return next;
      });
    }
    close();
  };

  const getInitials = (first?: string, last?: string) =>
    `${(first?.[0] || "").toUpperCase()}${(last?.[0] || "").toUpperCase()}` ||
    "U";

  const NavItem = ({ item }: { item: (typeof navigation)[0] }) => {
    const hasSub = !!item.subItems;
    const isActive =
      activePath === item.href ||
      (hasSub &&
        (item.subItems?.some((s) => activePath === s.href) ||
          tabOpenStates[item.href]));

    return (
      <li
        style={{
          display: "block",
          width: "100%",
          padding: rem(12),
          borderRadius: rem(8),
          color: isActive ? "#ffffff" : "#9ca3af",
          fontWeight: isActive ? 600 : 500,
          fontSize: rem(14),
          transition: "all .25s",
          listStyle: "none",
          position: "relative",
          marginBottom: hasSub ? rem(4) : 0,
          cursor: "pointer",
        }}
        onClick={() => handleTabClick(item)}
      >
        <Group gap="sm" style={{ position: "relative", zIndex: 1 }}>
          <item.icon size={20} />
          <Text size="sm">{item.name}</Text>
          {hasSub && (
            <Box
              style={{
                transition: "transform .25s",
                transform: tabOpenStates[item.href]
                  ? "rotate(180deg)"
                  : "rotate(0deg)",
                marginLeft: "auto",
              }}
            >
              <IconCaretDown size={16} />
            </Box>
          )}
        </Group>

        {hasSub && tabOpenStates[item.href] && (
          <ul
            style={{
              marginTop: 12,
              padding: "6px",
              listStyle: "none",
              // background: "linear-gradient(135deg, #1f2937, #111827)", // dark gradient
              borderRadius: rem(6),
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(0,0,0,.25)",
            }}
          >
            {item.subItems!.map((sub) => {
              const subActive = activePath === sub.href;
              return (
                <li
                  key={sub.name}
                  style={{
                    padding: "8px 10px",
                    color: subActive ? "#ffffff" : "#e5e7eb",
                    backgroundColor: subActive ? "#1e40af" : "transparent",
                    fontSize: rem(13),
                    borderRadius: rem(4),
                    display: "flex",
                    alignItems: "center",
                    transition: "all .2s",
                    cursor: "pointer",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSubItemClick(sub.href);
                  }}
                  onMouseEnter={(e) => {
                    if (!subActive)
                      e.currentTarget.style.backgroundColor =
                        "rgba(255,255,255,.06)";
                  }}
                  onMouseLeave={(e) => {
                    if (!subActive)
                      e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  {sub.name}
                </li>
              );
            })}
          </ul>
        )}
      </li>
    );
  };

  // const fetchTerritoryOptions = async (inputValue: string) => {};

  return (
    <AppShell
      navbar={{
        width: { base: 260, sm: 280 },
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding={{ base: "md", sm: "lg" }}
      styles={{
        main: {
          backgroundColor: "#ffffff",
          minHeight: "100vh",
        },
      }}
    >
      {/* Removed top header to free vertical space */}

      {/* ---------- Logout Modal ---------- */}
      <Modal
        opened={logoutModal}
        onClose={() => setLogoutModal(false)}
        title={
          <h2 className="text-lg font-semibold text-gray-800">
            Confirm Logout
          </h2>
        }
        centered
      >
        <div className="space-y-6">
          <p className="text-gray-700 text-sm">
            Are you sure you want to log out?
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
              onClick={() => setLogoutModal(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-red-600 rounded hover:bg-red-700 transition-colors"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </Modal>

      {/* ---------- Sidebar ---------- */}
      <AppShell.Navbar
        p="md"
        style={{
          backgroundColor: "#000000",
          border: "none",
        }}
      >
        <AppShell.Section>
          <Group px="md" py="sm">
            <Box
              style={{
                width: rem(40),
                height: rem(40),
                backgroundColor: "#ffffff",
                borderRadius: rem(8),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text size="lg" fw={700} c="#1f2937">
                R
              </Text>
            </Box>
            <Text size="lg" fw={700} c="#ffffff">
              R-OS
            </Text>
          </Group>
          <Divider color="#e5e7eb" />
        </AppShell.Section>

        <AppShell.Section grow>
          <div
            style={{
              height: "100%",
              overflowY: "auto",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {/* <style>{`div::-webkit-scrollbar { display: none; }`}</style> */}
            <ul style={{ padding: 0, margin: 0 }}>
              {filteredNavigation.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </ul>
          </div>
        </AppShell.Section>
      </AppShell.Navbar>

      {/* ---------- Main ---------- */}
      <AppShell.Main>
        {/* Compact welcome/user section above main content */}
        <Group py="sm" justify="space-between" align="flex-start">
          {/* LEFT SECTION — Welcome + Search */}
          <Box>
            <Group gap="md" align="center">
              <Burger
                opened={opened}
                onClick={toggle}
                hiddenFrom="sm"
                size="sm"
                color="#6c757d"
              />

              <Text size="lg" fw={700} c="#111827">
                Welcome back, {capitalizeFirstLetter(displayFirstName)}{" "}
                {capitalizeFirstLetter(displayLastName)}
              </Text>
            </Group>

            {territoryError &&
              territoryError !== "An unexpected error occurred" && (
                <Text size="xs" color="red" c="#e11d48" mt={4}>
                  {territoryError}
                </Text>
              )}

            {/* ✅ Territory Search Below Welcome */}
            <Box mt="sm">
              <AsyncSelect
                cacheOptions
                defaultOptions={[
                  { label: "All Territories", value: "ALL" },
                  ...territorySelectData,
                ]}
                loadOptions={fetchTerritoryOptions}
                value={
                  selectedTerritory
                    ? {
                        label: selectedTerritory.name,
                        value: selectedTerritory.id,
                      }
                    : { label: "All Territories", value: "ALL" }
                }
                onChange={(option: any) => {
                  if (!option) return;
                  if (option.value === "ALL") {
                    selectTerritory("all");
                    return;
                  }
                  selectTerritory(option.value);
                }}
                placeholder="Search by area or pincode..."
                styles={{
                  container: (base) => ({
                    ...base,
                    minWidth: 280,
                    width: 320,
                  }),
                  control: (base) => ({
                    ...base,
                    minHeight: 30,
                    borderColor: "#e5e7eb",
                    boxShadow: "none",
                    "&:hover": { borderColor: "#d1d5db" },
                  }),
                  menu: (base) => ({
                    ...base,
                    zIndex: 9999,
                  }),
                  input: (base) => ({
                    ...base,
                    fontSize: 13,
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected
                      ? "#1e40af"
                      : state.isFocused
                      ? "#f3f4f6"
                      : "white",
                    color: state.isSelected ? "white" : "#111827",
                    cursor: "pointer",
                  }),
                }}
              />
            </Box>
          </Box>

          {/* RIGHT SECTION — User menu */}
          <Group gap="md">
            <Menu shadow="md" width={220} position="bottom-end">
              <Menu.Target>
                <UnstyledButton>
                  <Group gap="sm">
                    <Box visibleFrom="sm" ta="right">
                      <Text size="sm" fw={600} c="#111827" lineClamp={1}>
                        {capitalizeFirstLetter(displayFirstName)}{" "}
                        {capitalizeFirstLetter(displayLastName)}
                      </Text>
                      <Text size="xs" c="#6b7280" lineClamp={1}>
                        {getUserRoleLabel(effectiveRoles)}
                      </Text>
                      {displayMobile && (
                        <Text size="xs" c="#6b7280" lineClamp={1}>
                          Mobile: {displayMobile}
                        </Text>
                      )}
                    </Box>

                    <Avatar
                      size={36}
                      radius="xl"
                      src={user?.avatar}
                      style={{
                        backgroundColor: "#e5e7eb",
                        color: "#111827",
                        fontWeight: 700,
                      }}
                    >
                      {getInitials(displayFirstName, displayLastName)}
                    </Avatar>
                  </Group>
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconLogout size={14} />}
                  color="red"
                  onClick={() => setLogoutModal(true)}
                >
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>

        <Divider color="#e5e7eb" />

        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
};
