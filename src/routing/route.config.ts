export const ROLE_DEFAULTS: Record<string, string> = {
  SuperAdmin: '/society-management',
  Manager: "/dashboard"
};

export const ROLE_ROUTES: Record<string, string[]> = {
  SuperAdmin: [
    '/dashboard',
    '/society-management',
    '/building-settings/building-details',
    '/building-settings/floors',
    '/building-settings/blocks',
    '/building-settings/units',
    '/building-settings/notice-board',
    // Legacy routes for backward compatibility
    '/building-details',
    '/floors',
    '/blocks',
    '/units',
    '/notice-board',
  ],
  Manager: [
    '/dashboard',
    '/building-settings/building-details',
    '/building-settings/floors',
    '/building-settings/blocks',
    '/building-settings/units',
    '/building-settings/notice-board',
    // Legacy routes for backward compatibility
    '/building-details',
    '/floors',
    '/blocks',
    '/units',
    '/notice-board',
  ],
};