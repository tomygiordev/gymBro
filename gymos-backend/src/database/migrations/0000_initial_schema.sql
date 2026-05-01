-- Initial migration for GymOS
-- Run: npm run db:generate && npm run db:migrate

CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  timezone TEXT DEFAULT 'America/Argentina/Buenos_Aires',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  opening_time TEXT DEFAULT '06:00',
  closing_time TEXT DEFAULT '22:00',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMP
);

CREATE INDEX branches_tenant_id_idx ON branches(tenant_id);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name TEXT NOT NULL,
  permissions TEXT[] NOT NULL DEFAULT '{}',
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX roles_tenant_id_idx ON roles(tenant_id);

CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  role_id UUID NOT NULL REFERENCES roles(id),
  branch_id UUID REFERENCES branches(id),
  assigned_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS staff_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  hire_date TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX staff_profiles_user_id_idx ON staff_profiles(user_id);
CREATE INDEX staff_profiles_tenant_id_idx ON staff_profiles(tenant_id);

CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  document_type TEXT DEFAULT 'DNI',
  document_number TEXT,
  email TEXT,
  phone TEXT,
  phone_normalized TEXT,
  date_of_birth TIMESTAMP,
  address TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  notes TEXT,
  photo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMP
);

CREATE INDEX members_tenant_id_idx ON members(tenant_id);
CREATE INDEX members_document_idx ON members(tenant_id, document_number);
CREATE INDEX members_phone_idx ON members(tenant_id, phone_normalized);
CREATE INDEX members_name_idx ON members(tenant_id, last_name, first_name);

CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name TEXT NOT NULL,
  description TEXT,
  price_monthly INTEGER NOT NULL,
  currency TEXT DEFAULT 'ARS',
  duration_days INTEGER DEFAULT 30,
  features TEXT[] DEFAULT '{}',
  allows_group_classes BOOLEAN DEFAULT false,
  group_classes_per_month INTEGER DEFAULT 0,
  allows_all_branches BOOLEAN DEFAULT false,
  includes_personal_training BOOLEAN DEFAULT false,
  personal_training_sessions INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX plans_tenant_id_idx ON plans(tenant_id);

CREATE TABLE IF NOT EXISTS memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id),
  plan_id UUID NOT NULL REFERENCES plans(id),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  status TEXT NOT NULL DEFAULT 'active',
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  froze_at TIMESTAMP,
  froze_until TIMESTAMP,
  auto_renew BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX memberships_member_id_idx ON memberships(member_id);
CREATE INDEX memberships_tenant_id_idx ON memberships(tenant_id);
CREATE INDEX memberships_status_idx ON memberships(tenant_id, status);

CREATE TABLE IF NOT EXISTS membership_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id UUID NOT NULL REFERENCES memberships(id),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  change_type TEXT NOT NULL,
  from_plan_id UUID REFERENCES plans(id),
  to_plan_id UUID REFERENCES plans(id),
  from_status TEXT,
  to_status TEXT,
  reason TEXT,
  price_before INTEGER,
  price_after INTEGER,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS membership_freezes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id UUID NOT NULL REFERENCES memberships(id),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  started_at TIMESTAMP NOT NULL,
  ends_at TIMESTAMP,
  original_end_date TIMESTAMP NOT NULL,
  resumed_at TIMESTAMP,
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id),
  membership_id UUID REFERENCES memberships(id),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  invoice_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  subtotal INTEGER NOT NULL,
  discount INTEGER DEFAULT 0,
  total INTEGER NOT NULL,
  due_date TIMESTAMP NOT NULL,
  paid_at TIMESTAMP,
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX invoices_member_id_idx ON invoices(member_id);
CREATE INDEX invoices_tenant_id_idx ON invoices(tenant_id);
CREATE INDEX invoices_status_idx ON invoices(tenant_id, status);

CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id),
  description TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price INTEGER NOT NULL,
  total INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id),
  member_id UUID NOT NULL REFERENCES members(id),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'ARS',
  method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  transaction_ref TEXT,
  processed_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX payments_invoice_id_idx ON payments(invoice_id);
CREATE INDEX payments_member_id_idx ON payments(member_id);
CREATE INDEX payments_tenant_id_idx ON payments(tenant_id);

CREATE TABLE IF NOT EXISTS checkin_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id),
  branch_id UUID REFERENCES branches(id),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  result TEXT NOT NULL,
  reason TEXT,
  idempotency_key TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX checkin_attempts_member_id_idx ON checkin_attempts(member_id);
CREATE INDEX checkin_attempts_tenant_id_idx ON checkin_attempts(tenant_id);
CREATE UNIQUE INDEX checkin_attempts_idempotency_idx ON checkin_attempts(idempotency_key) WHERE idempotency_key IS NOT NULL;

CREATE TABLE IF NOT EXISTS checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id),
  membership_id UUID REFERENCES memberships(id),
  branch_id UUID REFERENCES branches(id),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  checkin_type TEXT NOT NULL DEFAULT 'standard',
  class_session_id UUID,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX checkins_member_id_idx ON checkins(member_id);
CREATE INDEX checkins_branch_id_idx ON checkins(branch_id);
CREATE INDEX checkins_tenant_id_idx ON checkins(tenant_id);
CREATE INDEX checkins_date_idx ON checkins(tenant_id, created_at);

CREATE TABLE IF NOT EXISTS class_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  branch_id UUID NOT NULL REFERENCES branches(id),
  class_type TEXT NOT NULL,
  instructor_id UUID REFERENCES staff_profiles(id),
  room_name TEXT,
  starts_at TIMESTAMP NOT NULL,
  ends_at TIMESTAMP NOT NULL,
  max_capacity INTEGER NOT NULL DEFAULT 15,
  current_count INTEGER DEFAULT 0,
  waitlist_enabled BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX class_sessions_tenant_id_idx ON class_sessions(tenant_id);
CREATE INDEX class_sessions_branch_id_idx ON class_sessions(branch_id);
CREATE INDEX class_sessions_starts_at_idx ON class_sessions(tenant_id, starts_at);

CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_session_id UUID NOT NULL REFERENCES class_sessions(id),
  member_id UUID NOT NULL REFERENCES members(id),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  status TEXT NOT NULL DEFAULT 'confirmed',
  checked_in_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX reservations_class_session_idx ON reservations(class_session_id);
CREATE INDEX reservations_member_id_idx ON reservations(member_id);
CREATE INDEX reservations_status_idx ON reservations(class_session_id, status);

CREATE TABLE IF NOT EXISTS reservation_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_session_id UUID NOT NULL REFERENCES class_sessions(id),
  member_id UUID NOT NULL REFERENCES members(id),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  position INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting',
  promoted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX audit_logs_tenant_id_idx ON audit_logs(tenant_id);
CREATE INDEX audit_logs_action_idx ON audit_logs(action);
CREATE INDEX audit_logs_date_idx ON audit_logs(created_at);

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  refresh_token_hash TEXT NOT NULL,
  user_agent TEXT,
  ip_address TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  revoked_at TIMESTAMP
);

CREATE INDEX sessions_user_id_idx ON sessions(user_id);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX password_reset_tokens_user_id_idx ON password_reset_tokens(user_id);