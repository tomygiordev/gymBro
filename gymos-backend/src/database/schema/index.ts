import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const tenantsTable = sqliteTable('tenants', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  logoUrl: text('logo_url'),
  contactEmail: text('contact_email').notNull(),
  contactPhone: text('contact_phone'),
  timezone: text('timezone').default('America/Argentina/Buenos_Aires'),
  isActive: integer('is_active').default(1),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
});

export const branchesTable = sqliteTable('branches', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  name: text('name').notNull(),
  address: text('address'),
  phone: text('phone'),
  isActive: integer('is_active').default(1),
  openingTime: text('opening_time').default('06:00'),
  closingTime: text('closing_time').default('22:00'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
}, (table) => ({
  tenantIdx: index('branches_tenant_id_idx').on(table.tenantId),
}));

export const usersTable = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  passwordHash: text('password_hash').notNull(),
  isActive: integer('is_active').default(1),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
}, (table) => ({
  emailIdx: uniqueIndex('users_email_idx').on(table.email),
}));

export const rolesTable = sqliteTable('roles', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  name: text('name').notNull(),
  permissions: text('permissions').notNull().default('[]'),
  isSystem: integer('is_system').default(0),
  createdAt: text('created_at').notNull(),
}, (table) => ({
  tenantIdx: index('roles_tenant_id_idx').on(table.tenantId),
}));

export const userRolesTable = sqliteTable('user_roles', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  roleId: text('role_id').notNull(),
  branchId: text('branch_id'),
  assignedAt: text('assigned_at').notNull(),
});

export const staffProfilesTable = sqliteTable('staff_profiles', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  tenantId: text('tenant_id').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  phone: text('phone'),
  avatarUrl: text('avatar_url'),
  hireDate: text('hire_date'),
  isActive: integer('is_active').default(1),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => ({
  userIdx: index('staff_profiles_user_id_idx').on(table.userId),
  tenantIdx: index('staff_profiles_tenant_id_idx').on(table.tenantId),
}));

export const staffBranchAssignmentsTable = sqliteTable('staff_branch_assignments', {
  id: text('id').primaryKey(),
  staffProfileId: text('staff_profile_id').notNull(),
  branchId: text('branch_id').notNull(),
  assignedAt: text('assigned_at').notNull(),
});

export const sessionsTable = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  refreshTokenHash: text('refresh_token_hash').notNull(),
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').notNull(),
  revokedAt: text('revoked_at'),
}, (table) => ({
  userIdx: index('sessions_user_id_idx').on(table.userId),
}));

export const passwordResetTokensTable = sqliteTable('password_reset_tokens', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  tokenHash: text('token_hash').notNull(),
  expiresAt: text('expires_at').notNull(),
  usedAt: text('used_at'),
  createdAt: text('created_at').notNull(),
}, (table) => ({
  userIdx: index('password_reset_tokens_user_id_idx').on(table.userId),
}));

export const membersTable = sqliteTable('members', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  documentType: text('document_type').default('DNI'),
  documentNumber: text('document_number'),
  email: text('email'),
  phone: text('phone'),
  phoneNormalized: text('phone_normalized'),
  dateOfBirth: text('date_of_birth'),
  address: text('address'),
  emergencyContactName: text('emergency_contact_name'),
  emergencyContactPhone: text('emergency_contact_phone'),
  notes: text('notes'),
  photoUrl: text('photo_url'),
  isActive: integer('is_active').default(1),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
}, (table) => ({
  tenantIdx: index('members_tenant_id_idx').on(table.tenantId),
  documentIdx: index('members_document_idx').on(table.tenantId, table.documentNumber),
  phoneIdx: index('members_phone_idx').on(table.tenantId, table.phoneNormalized),
  nameIdx: index('members_name_idx').on(table.tenantId, table.lastName, table.firstName),
}));

export const plansTable = sqliteTable('plans', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  priceMonthly: integer('price_monthly').notNull(),
  currency: text('currency').default('ARS'),
  durationDays: integer('duration_days').default(30),
  features: text('features').notNull().default('[]'),
  allowsGroupClasses: integer('allows_group_classes').default(0),
  groupClassesPerMonth: integer('group_classes_per_month').default(0),
  allowsAllBranches: integer('allows_all_branches').default(0),
  includesPersonalTraining: integer('includes_personal_training').default(0),
  personalTrainingSessions: integer('personal_training_sessions').default(0),
  isActive: integer('is_active').default(1),
  sortOrder: integer('sort_order').default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => ({
  tenantIdx: index('plans_tenant_id_idx').on(table.tenantId),
}));

export const membershipsTable = sqliteTable('memberships', {
  id: text('id').primaryKey(),
  memberId: text('member_id').notNull(),
  planId: text('plan_id').notNull(),
  tenantId: text('tenant_id').notNull(),
  status: text('status').notNull().default('active'),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  frozeAt: text('froze_at'),
  frozeUntil: text('froze_until'),
  autoRenew: integer('auto_renew').default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => ({
  memberIdx: index('memberships_member_id_idx').on(table.memberId),
  tenantIdx: index('memberships_tenant_id_idx').on(table.tenantId),
  statusIdx: index('memberships_status_idx').on(table.tenantId, table.status),
}));

export const membershipChangesTable = sqliteTable('membership_changes', {
  id: text('id').primaryKey(),
  membershipId: text('membership_id').notNull(),
  tenantId: text('tenant_id').notNull(),
  changeType: text('change_type').notNull(),
  fromPlanId: text('from_plan_id'),
  toPlanId: text('to_plan_id'),
  fromStatus: text('from_status'),
  toStatus: text('to_status'),
  reason: text('reason'),
  priceBefore: integer('price_before'),
  priceAfter: integer('price_after'),
  createdAt: text('created_at').notNull(),
  createdBy: text('created_by'),
}, (table) => ({
  membershipIdx: index('membership_changes_membership_id_idx').on(table.membershipId),
}));

export const membershipFreezesTable = sqliteTable('membership_freezes', {
  id: text('id').primaryKey(),
  membershipId: text('membership_id').notNull(),
  tenantId: text('tenant_id').notNull(),
  startedAt: text('started_at').notNull(),
  endsAt: text('ends_at'),
  originalEndDate: text('original_end_date').notNull(),
  resumedAt: text('resumed_at'),
  reason: text('reason'),
  createdAt: text('created_at').notNull(),
}, (table) => ({
  membershipIdx: index('membership_freezes_membership_id_idx').on(table.membershipId),
}));

export const invoicesTable = sqliteTable('invoices', {
  id: text('id').primaryKey(),
  memberId: text('member_id').notNull(),
  membershipId: text('membership_id'),
  tenantId: text('tenant_id').notNull(),
  invoiceNumber: text('invoice_number').notNull(),
  status: text('status').notNull().default('pending'),
  subtotal: integer('subtotal').notNull(),
  discount: integer('discount').default(0),
  total: integer('total').notNull(),
  dueDate: text('due_date').notNull(),
  paidAt: text('paid_at'),
  paymentMethod: text('payment_method'),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => ({
  memberIdx: index('invoices_member_id_idx').on(table.memberId),
  tenantIdx: index('invoices_tenant_id_idx').on(table.tenantId),
  statusIdx: index('invoices_status_idx').on(table.tenantId, table.status),
}));

export const invoiceItemsTable = sqliteTable('invoice_items', {
  id: text('id').primaryKey(),
  invoiceId: text('invoice_id').notNull(),
  description: text('description').notNull(),
  quantity: integer('quantity').default(1),
  unitPrice: integer('unit_price').notNull(),
  total: integer('total').notNull(),
});

export const paymentsTable = sqliteTable('payments', {
  id: text('id').primaryKey(),
  invoiceId: text('invoice_id'),
  memberId: text('member_id').notNull(),
  tenantId: text('tenant_id').notNull(),
  amount: integer('amount').notNull(),
  currency: text('currency').default('ARS'),
  method: text('method').notNull(),
  status: text('status').notNull().default('completed'),
  transactionRef: text('transaction_ref'),
  processedAt: text('processed_at'),
  createdAt: text('created_at').notNull(),
}, (table) => ({
  invoiceIdx: index('payments_invoice_id_idx').on(table.invoiceId),
  memberIdx: index('payments_member_id_idx').on(table.memberId),
  tenantIdx: index('payments_tenant_id_idx').on(table.tenantId),
}));

export const checkinAttemptsTable = sqliteTable('checkin_attempts', {
  id: text('id').primaryKey(),
  memberId: text('member_id').notNull(),
  branchId: text('branch_id'),
  tenantId: text('tenant_id').notNull(),
  result: text('result').notNull(),
  reason: text('reason'),
  idempotencyKey: text('idempotency_key'),
  createdAt: text('created_at').notNull(),
}, (table) => ({
  memberIdx: index('checkin_attempts_member_id_idx').on(table.memberId),
  tenantIdx: index('checkin_attempts_tenant_id_idx').on(table.tenantId),
  idempotencyIdx: uniqueIndex('checkin_attempts_idempotency_idx').on(table.idempotencyKey),
}));

export const checkinsTable = sqliteTable('checkins', {
  id: text('id').primaryKey(),
  memberId: text('member_id').notNull(),
  membershipId: text('membership_id'),
  branchId: text('branch_id'),
  tenantId: text('tenant_id').notNull(),
  checkinType: text('checkin_type').notNull().default('standard'),
  classSessionId: text('class_session_id'),
  createdAt: text('created_at').notNull(),
}, (table) => ({
  memberIdx: index('checkins_member_id_idx').on(table.memberId),
  branchIdx: index('checkins_branch_id_idx').on(table.branchId),
  tenantIdx: index('checkins_tenant_id_idx').on(table.tenantId),
  dateIdx: index('checkins_date_idx').on(table.tenantId, table.createdAt),
}));

export const classSessionsTable = sqliteTable('class_sessions', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  branchId: text('branch_id').notNull(),
  classType: text('class_type').notNull(),
  instructorId: text('instructor_id'),
  roomName: text('room_name'),
  startsAt: text('starts_at').notNull(),
  endsAt: text('ends_at').notNull(),
  maxCapacity: integer('max_capacity').notNull().default(15),
  currentCount: integer('current_count').default(0),
  waitlistEnabled: integer('waitlist_enabled').default(1),
  isActive: integer('is_active').default(1),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => ({
  tenantIdx: index('class_sessions_tenant_id_idx').on(table.tenantId),
  branchIdx: index('class_sessions_branch_id_idx').on(table.branchId),
  startsAtIdx: index('class_sessions_starts_at_idx').on(table.tenantId, table.startsAt),
}));

export const reservationsTable = sqliteTable('reservations', {
  id: text('id').primaryKey(),
  classSessionId: text('class_session_id').notNull(),
  memberId: text('member_id').notNull(),
  tenantId: text('tenant_id').notNull(),
  status: text('status').notNull().default('confirmed'),
  checkedInAt: text('checked_in_at'),
  cancelledAt: text('cancelled_at'),
  createdAt: text('created_at').notNull(),
}, (table) => ({
  classIdx: index('reservations_class_session_idx').on(table.classSessionId),
  memberIdx: index('reservations_member_id_idx').on(table.memberId),
  statusIdx: index('reservations_status_idx').on(table.classSessionId, table.status),
}));

export const reservationWaitlistTable = sqliteTable('reservation_waitlist', {
  id: text('id').primaryKey(),
  classSessionId: text('class_session_id').notNull(),
  memberId: text('member_id').notNull(),
  tenantId: text('tenant_id').notNull(),
  position: integer('position').notNull(),
  status: text('status').notNull().default('waiting'),
  promotedAt: text('promoted_at'),
  createdAt: text('created_at').notNull(),
}, (table) => ({
  classIdx: index('reservation_waitlist_class_idx').on(table.classSessionId),
  positionIdx: index('reservation_waitlist_position_idx').on(table.classSessionId, table.position),
}));

export const auditLogsTable = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  userId: text('user_id'),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id'),
  metadata: text('metadata'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: text('created_at').notNull(),
}, (table) => ({
  tenantIdx: index('audit_logs_tenant_id_idx').on(table.tenantId),
  actionIdx: index('audit_logs_action_idx').on(table.action),
  dateIdx: index('audit_logs_date_idx').on(table.createdAt),
}));

export type Tenant = typeof tenantsTable.$inferSelect;
export type Branch = typeof branchesTable.$inferSelect;
export type User = typeof usersTable.$inferSelect;
export type Role = typeof rolesTable.$inferSelect;
export type UserRole = typeof userRolesTable.$inferSelect;
export type StaffProfile = typeof staffProfilesTable.$inferSelect;
export type StaffBranchAssignment = typeof staffBranchAssignmentsTable.$inferSelect;
export type Session = typeof sessionsTable.$inferSelect;
export type PasswordResetToken = typeof passwordResetTokensTable.$inferSelect;
export type Member = typeof membersTable.$inferSelect;
export type Plan = typeof plansTable.$inferSelect;
export type Membership = typeof membershipsTable.$inferSelect;
export type MembershipChange = typeof membershipChangesTable.$inferSelect;
export type MembershipFreeze = typeof membershipFreezesTable.$inferSelect;
export type Invoice = typeof invoicesTable.$inferSelect;
export type InvoiceItem = typeof invoiceItemsTable.$inferSelect;
export type Payment = typeof paymentsTable.$inferSelect;
export type CheckinAttempt = typeof checkinAttemptsTable.$inferSelect;
export type Checkin = typeof checkinsTable.$inferSelect;
export type ClassSession = typeof classSessionsTable.$inferSelect;
export type Reservation = typeof reservationsTable.$inferSelect;
export type ReservationWaitlist = typeof reservationWaitlistTable.$inferSelect;
export type AuditLog = typeof auditLogsTable.$inferSelect;