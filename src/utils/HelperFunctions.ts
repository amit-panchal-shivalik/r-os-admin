// utils/stringUtils.ts
export const capitalizeFirstLetter = (str: string) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// utils/getUserRoleLabel.ts
export const USER_TYPE_OPTIONS = [
  { label: "Registered user", value: "registered_user" },
  {
    label: "Territory governance / committee",
    value: "territory_governance_committee",
  },
  { label: "Channel partner", value: "channel_partner" },
  {
    label: "Developer | Builder | Sales admin",
    value: "developer_builder_sales_admin",
  },
  { label: "GIS operator | Data Admin", value: "gis_operator" },
];

export const getUserRoleLabel = (role?: string | string[]): string => {
  if (!role) return "No Role";
  // console.log("role", role);
  const roles = Array.isArray(role) ? role : [role];

  const labels = roles
    .map((r) => USER_TYPE_OPTIONS.find((opt) => opt.value === r)?.label || r)
    .filter(Boolean);

  return labels.length > 0 ? labels.join(", ") : "No Role";
};
