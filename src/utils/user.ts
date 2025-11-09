export interface NormalizedUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  role: string;
  userRoles?: string[];
  firstName?: string;
  lastName?: string;
  mobile_number?: string;
}

const splitName = (fullName: string) => {
  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const [firstName = "", ...rest] = parts;
  return {
    firstName,
    lastName: rest.join(" "),
  };
};

export const normalizeUserPayload = (payload: any): NormalizedUser => {
  const rawRoles: string[] = Array.isArray(payload.userRoles)
    ? payload.userRoles
    : Array.isArray(payload.roles)
    ? payload.roles
    : [];
  const fullName =
    payload.full_name || payload.fullName || payload.name || "Unknown User";
  const { firstName, lastName } = splitName(fullName);
  const roleString = rawRoles.join(", ");

  return {
    id: payload.user_id || payload.id || "",
    name: fullName,
    email: payload.email || "",
    phone: payload.mobile_number || payload.phone || "",
    avatar: payload.avatar || undefined,
    role: roleString,
    userRoles: rawRoles,
    firstName,
    lastName,
    mobile_number: payload.mobile_number || payload.phone || "",
  };
};
