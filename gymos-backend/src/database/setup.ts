import initSqlJs from 'sql.js';
import * as fs from 'fs';
import * as path from 'path';

const dbPath = process.env['DATABASE_URL'] || './data/gymos.db';

async function setup() {
  console.log('Setting up SQLite database...');

  const SQL = await initSqlJs();
  let db;

  try {
    const dbDir = path.dirname(dbPath);
    if (dbDir && dbDir !== '.' && !fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    if (fs.existsSync(dbPath)) {
      const fileBuffer = fs.readFileSync(dbPath);
      db = new SQL.Database(fileBuffer);
      console.log('Loaded existing database');
    } else {
      db = new SQL.Database();
      console.log('Created new database');
    }
  } catch {
    db = new SQL.Database();
  }

  const stmts = [
    `CREATE TABLE IF NOT EXISTS tenants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      logo_url TEXT,
      contact_email TEXT NOT NULL,
      contact_phone TEXT,
      timezone TEXT DEFAULT 'America/Argentina/Buenos_Aires',
      is_active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS branches (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      name TEXT NOT NULL,
      address TEXT,
      phone TEXT,
      is_active INTEGER DEFAULT 1,
      opening_time TEXT DEFAULT '06:00',
      closing_time TEXT DEFAULT '22:00',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT
    )`,
    `CREATE INDEX IF NOT EXISTS branches_tenant_id_idx ON branches(tenant_id)`,
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS users_email_idx ON users(email)`,
    `CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      name TEXT NOT NULL,
      permissions TEXT NOT NULL DEFAULT '[]',
      is_system INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS roles_tenant_id_idx ON roles(tenant_id)`,
    `CREATE TABLE IF NOT EXISTS user_roles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      role_id TEXT NOT NULL,
      branch_id TEXT,
      assigned_at TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS staff_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      tenant_id TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone TEXT,
      avatar_url TEXT,
      hire_date TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS staff_profiles_user_id_idx ON staff_profiles(user_id)`,
    `CREATE INDEX IF NOT EXISTS staff_profiles_tenant_id_idx ON staff_profiles(tenant_id)`,
    `CREATE TABLE IF NOT EXISTS staff_branch_assignments (
      id TEXT PRIMARY KEY,
      staff_profile_id TEXT NOT NULL,
      branch_id TEXT NOT NULL,
      assigned_at TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      refresh_token_hash TEXT NOT NULL,
      user_agent TEXT,
      ip_address TEXT,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      revoked_at TEXT
    )`,
    `CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id)`,
    `CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token_hash TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used_at TEXT,
      created_at TEXT NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS password_reset_tokens_user_id_idx ON password_reset_tokens(user_id)`,
    `CREATE TABLE IF NOT EXISTS members (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      document_type TEXT DEFAULT 'DNI',
      document_number TEXT,
      email TEXT,
      phone TEXT,
      phone_normalized TEXT,
      date_of_birth TEXT,
      address TEXT,
      emergency_contact_name TEXT,
      emergency_contact_phone TEXT,
      notes TEXT,
      photo_url TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT
    )`,
    `CREATE INDEX IF NOT EXISTS members_tenant_id_idx ON members(tenant_id)`,
    `CREATE INDEX IF NOT EXISTS members_document_idx ON members(tenant_id, document_number)`,
    `CREATE INDEX IF NOT EXISTS members_phone_idx ON members(tenant_id, phone_normalized)`,
    `CREATE INDEX IF NOT EXISTS members_name_idx ON members(tenant_id, last_name, first_name)`,
    `CREATE TABLE IF NOT EXISTS plans (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      price_monthly INTEGER NOT NULL,
      currency TEXT DEFAULT 'ARS',
      duration_days INTEGER DEFAULT 30,
      features TEXT NOT NULL DEFAULT '[]',
      allows_group_classes INTEGER DEFAULT 0,
      group_classes_per_month INTEGER DEFAULT 0,
      allows_all_branches INTEGER DEFAULT 0,
      includes_personal_training INTEGER DEFAULT 0,
      personal_training_sessions INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS plans_tenant_id_idx ON plans(tenant_id)`,
    `CREATE TABLE IF NOT EXISTS memberships (
      id TEXT PRIMARY KEY,
      member_id TEXT NOT NULL,
      plan_id TEXT NOT NULL,
      tenant_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      froze_at TEXT,
      froze_until TEXT,
      auto_renew INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS memberships_member_id_idx ON memberships(member_id)`,
    `CREATE INDEX IF NOT EXISTS memberships_tenant_id_idx ON memberships(tenant_id)`,
    `CREATE INDEX IF NOT EXISTS memberships_status_idx ON memberships(tenant_id, status)`,
    `CREATE TABLE IF NOT EXISTS membership_changes (
      id TEXT PRIMARY KEY,
      membership_id TEXT NOT NULL,
      tenant_id TEXT NOT NULL,
      change_type TEXT NOT NULL,
      from_plan_id TEXT,
      to_plan_id TEXT,
      from_status TEXT,
      to_status TEXT,
      reason TEXT,
      price_before INTEGER,
      price_after INTEGER,
      created_at TEXT NOT NULL,
      created_by TEXT
    )`,
    `CREATE INDEX IF NOT EXISTS membership_changes_membership_id_idx ON membership_changes(membership_id)`,
    `CREATE TABLE IF NOT EXISTS membership_freezes (
      id TEXT PRIMARY KEY,
      membership_id TEXT NOT NULL,
      tenant_id TEXT NOT NULL,
      started_at TEXT NOT NULL,
      ends_at TEXT,
      original_end_date TEXT NOT NULL,
      resumed_at TEXT,
      reason TEXT,
      created_at TEXT NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS membership_freezes_membership_id_idx ON membership_freezes(membership_id)`,
    `CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      member_id TEXT NOT NULL,
      membership_id TEXT,
      tenant_id TEXT NOT NULL,
      invoice_number TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      subtotal INTEGER NOT NULL,
      discount INTEGER DEFAULT 0,
      total INTEGER NOT NULL,
      due_date TEXT NOT NULL,
      paid_at TEXT,
      payment_method TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS invoices_member_id_idx ON invoices(member_id)`,
    `CREATE INDEX IF NOT EXISTS invoices_tenant_id_idx ON invoices(tenant_id)`,
    `CREATE INDEX IF NOT EXISTS invoices_status_idx ON invoices(tenant_id, status)`,
    `CREATE TABLE IF NOT EXISTS invoice_items (
      id TEXT PRIMARY KEY,
      invoice_id TEXT NOT NULL,
      description TEXT NOT NULL,
      quantity INTEGER DEFAULT 1,
      unit_price INTEGER NOT NULL,
      total INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      invoice_id TEXT,
      member_id TEXT NOT NULL,
      tenant_id TEXT NOT NULL,
      amount INTEGER NOT NULL,
      currency TEXT DEFAULT 'ARS',
      method TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'completed',
      transaction_ref TEXT,
      processed_at TEXT,
      created_at TEXT NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS payments_invoice_id_idx ON payments(invoice_id)`,
    `CREATE INDEX IF NOT EXISTS payments_member_id_idx ON payments(member_id)`,
    `CREATE INDEX IF NOT EXISTS payments_tenant_id_idx ON payments(tenant_id)`,
    `CREATE TABLE IF NOT EXISTS checkin_attempts (
      id TEXT PRIMARY KEY,
      member_id TEXT NOT NULL,
      branch_id TEXT,
      tenant_id TEXT NOT NULL,
      result TEXT NOT NULL,
      reason TEXT,
      idempotency_key TEXT,
      created_at TEXT NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS checkin_attempts_member_id_idx ON checkin_attempts(member_id)`,
    `CREATE INDEX IF NOT EXISTS checkin_attempts_tenant_id_idx ON checkin_attempts(tenant_id)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS checkin_attempts_idempotency_idx ON checkin_attempts(idempotency_key)`,
    `CREATE TABLE IF NOT EXISTS checkins (
      id TEXT PRIMARY KEY,
      member_id TEXT NOT NULL,
      membership_id TEXT,
      branch_id TEXT,
      tenant_id TEXT NOT NULL,
      checkin_type TEXT NOT NULL DEFAULT 'standard',
      class_session_id TEXT,
      created_at TEXT NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS checkins_member_id_idx ON checkins(member_id)`,
    `CREATE INDEX IF NOT EXISTS checkins_branch_id_idx ON checkins(branch_id)`,
    `CREATE INDEX IF NOT EXISTS checkins_tenant_id_idx ON checkins(tenant_id)`,
    `CREATE INDEX IF NOT EXISTS checkins_date_idx ON checkins(tenant_id, created_at)`,
    `CREATE TABLE IF NOT EXISTS class_sessions (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      branch_id TEXT NOT NULL,
      class_type TEXT NOT NULL,
      instructor_id TEXT,
      room_name TEXT,
      starts_at TEXT NOT NULL,
      ends_at TEXT NOT NULL,
      max_capacity INTEGER NOT NULL DEFAULT 15,
      current_count INTEGER DEFAULT 0,
      waitlist_enabled INTEGER DEFAULT 1,
      is_active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS class_sessions_tenant_id_idx ON class_sessions(tenant_id)`,
    `CREATE INDEX IF NOT EXISTS class_sessions_branch_id_idx ON class_sessions(branch_id)`,
    `CREATE INDEX IF NOT EXISTS class_sessions_starts_at_idx ON class_sessions(tenant_id, starts_at)`,
    `CREATE TABLE IF NOT EXISTS reservations (
      id TEXT PRIMARY KEY,
      class_session_id TEXT NOT NULL,
      member_id TEXT NOT NULL,
      tenant_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'confirmed',
      checked_in_at TEXT,
      cancelled_at TEXT,
      created_at TEXT NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS reservations_class_session_idx ON reservations(class_session_id)`,
    `CREATE INDEX IF NOT EXISTS reservations_member_id_idx ON reservations(member_id)`,
    `CREATE INDEX IF NOT EXISTS reservations_status_idx ON reservations(class_session_id, status)`,
    `CREATE TABLE IF NOT EXISTS reservation_waitlist (
      id TEXT PRIMARY KEY,
      class_session_id TEXT NOT NULL,
      member_id TEXT NOT NULL,
      tenant_id TEXT NOT NULL,
      position INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'waiting',
      promoted_at TEXT,
      created_at TEXT NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS reservation_waitlist_class_idx ON reservation_waitlist(class_session_id)`,
    `CREATE INDEX IF NOT EXISTS reservation_waitlist_position_idx ON reservation_waitlist(class_session_id, position)`,
    `CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      user_id TEXT,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      metadata TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at TEXT NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS audit_logs_tenant_id_idx ON audit_logs(tenant_id)`,
    `CREATE INDEX IF NOT EXISTS audit_logs_action_idx ON audit_logs(action)`,
    `CREATE INDEX IF NOT EXISTS audit_logs_date_idx ON audit_logs(created_at)`,
  ];

  for (const sql of stmts) {
    db.run(sql);
  }

  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);

  console.log('Database setup complete!');
  console.log(`Tables created at: ${dbPath}`);

  db.close();
  process.exit(0);
}

setup().catch((err) => {
  console.error('Setup failed:', err);
  process.exit(1);
});
