export const TENANT_HEADER = 'x-tenant-id';

export const MEMBERSHIP_STATUS = {
  ACTIVE: 'active',
  WARNING: 'warning',
  EXPIRED: 'expired',
  FROZEN: 'frozen',
} as const;

export const MEMBERSHIP_WARNING_DAYS = 7;

export const CHECKIN_RESULT = {
  SUCCESS: 'success',
  WARNING: 'warning',
  DENIED: 'denied',
} as const;

export const MEMBERSHIP_CHANGE_TYPES = {
  CREATED: 'created',
  RENEWED: 'renewed',
  UPGRADED: 'upgraded',
  DOWNGRADED: 'downgraded',
  FROZEN: 'frozen',
  UNFROZEN: 'unfrozen',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
} as const;

export const PERMISSIONS = {
  MEMBERS_READ: 'members:read',
  MEMBERS_WRITE: 'members:write',
  MEMBERS_DELETE: 'members:delete',
  MEMBERSHIPS_READ: 'memberships:read',
  MEMBERSHIPS_WRITE: 'memberships:write',
  CHECKINS_READ: 'checkins:read',
  CHECKINS_WRITE: 'checkins:write',
  REPORTS_READ: 'reports:read',
  STAFF_READ: 'staff:read',
  STAFF_WRITE: 'staff:write',
  SETTINGS_READ: 'settings:read',
  SETTINGS_WRITE: 'settings:write',
} as const;

export const DEFAULT_ROLE_PERMISSIONS = {
  ADMIN: Object.values({
    MEMBERS_READ: true,
    MEMBERS_WRITE: true,
    MEMBERS_DELETE: true,
    MEMBERSHIPS_READ: true,
    MEMBERSHIPS_WRITE: true,
    CHECKINS_READ: true,
    CHECKINS_WRITE: true,
    REPORTS_READ: true,
    STAFF_READ: true,
    STAFF_WRITE: true,
    SETTINGS_READ: true,
    SETTINGS_WRITE: true,
  }),
  MANAGER: {
    MEMBERS_READ: true,
    MEMBERS_WRITE: true,
    MEMBERS_DELETE: false,
    MEMBERSHIPS_READ: true,
    MEMBERSHIPS_WRITE: true,
    CHECKINS_READ: true,
    CHECKINS_WRITE: true,
    REPORTS_READ: true,
    STAFF_READ: true,
    STAFF_WRITE: false,
    SETTINGS_READ: true,
    SETTINGS_WRITE: false,
  },
  RECEPTIONIST: {
    MEMBERS_READ: true,
    MEMBERS_WRITE: false,
    MEMBERS_DELETE: false,
    MEMBERSHIPS_READ: true,
    MEMBERSHIPS_WRITE: false,
    CHECKINS_READ: true,
    CHECKINS_WRITE: true,
    REPORTS_READ: false,
    STAFF_READ: false,
    STAFF_WRITE: false,
    SETTINGS_READ: false,
    SETTINGS_WRITE: false,
  },
  INSTRUCTOR: {
    MEMBERS_READ: true,
    MEMBERS_WRITE: false,
    MEMBERS_DELETE: false,
    MEMBERSHIPS_READ: true,
    MEMBERSHIPS_WRITE: false,
    CHECKINS_READ: true,
    CHECKINS_WRITE: true,
    REPORTS_READ: false,
    STAFF_READ: false,
    STAFF_WRITE: false,
    SETTINGS_READ: false,
    SETTINGS_WRITE: false,
  },
};