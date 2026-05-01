import initSqlJs from 'sql.js';
import { drizzle } from 'drizzle-orm/sql-js';
import * as schema from '../schema';
import { hashSync } from 'bcryptjs';

async function seed() {
  console.log('Seeding database...');

  const SQL = await initSqlJs();
  const dbPath = process.env['DATABASE_URL'] || './data/gymos.db';
  let db;

  try {
    const fs = require('fs');
    if (fs.existsSync(dbPath)) {
      const fileBuffer = fs.readFileSync(dbPath);
      db = new SQL.Database(fileBuffer);
    } else {
      db = new SQL.Database();
    }
  } catch {
    db = new SQL.Database();
  }

  const dbDrizzle = drizzle(db, { schema });

  const tenantId = '11111111-1111-1111-1111-111111111111';
  const userId = '33333333-3333-3333-3333-333333333333';
  const now = new Date().toISOString();
  const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const passwordHash = hashSync('demo1234', 10);

  await dbDrizzle.insert(schema.usersTable).values({
    id: userId,
    email: 'maria@gimnasio.com',
    passwordHash,
    isActive: 1,
    createdAt: now,
    updatedAt: now,
  });

  await dbDrizzle.insert(schema.staffProfilesTable).values({
    id: '44444444-4444-4444-4444-444444444444',
    userId,
    tenantId,
    firstName: 'María',
    lastName: 'García',
    phone: '+5491112345679',
    isActive: 1,
    createdAt: now,
    updatedAt: now,
  });

  const basicPlanId = '55555555-5555-5555-5555-555555555551';
  const premiumPlanId = '55555555-5555-5555-5555-555555555552';

  await dbDrizzle.insert(schema.plansTable).values([
    {
      id: basicPlanId,
      tenantId,
      name: 'Básico',
      description: 'Acceso área de musculación, 1 sucursal',
      priceMonthly: 2990000,
      durationDays: 30,
      features: JSON.stringify(['Acceso área de musculación', '1 sucursal', 'Sin clases grupales']),
      allowsGroupClasses: 0,
      allowsAllBranches: 0,
      sortOrder: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: premiumPlanId,
      tenantId,
      name: 'Premium',
      description: 'Acceso total + clases grupales, todas las sucursales',
      priceMonthly: 4990000,
      durationDays: 30,
      features: JSON.stringify(['Acceso total', 'Todas las sucursales', '4 clases grupales/mes']),
      allowsGroupClasses: 1,
      groupClassesPerMonth: 4,
      allowsAllBranches: 1,
      sortOrder: 2,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  const memberId = '66666666-6666-6666-6666-666666666666';
  await dbDrizzle.insert(schema.membersTable).values({
    id: memberId,
    tenantId,
    firstName: 'Fernando',
    lastName: 'Costas',
    documentType: 'DNI',
    documentNumber: '32145678',
    email: 'fernando.costas@gmail.com',
    phone: '+5491145678900',
    isActive: 1,
    createdAt: now,
    updatedAt: now,
  });

  await dbDrizzle.insert(schema.membershipsTable).values({
    id: '77777777-7777-7777-7777-777777777777',
    memberId,
    planId: premiumPlanId,
    tenantId,
    status: 'active',
    startDate: now,
    endDate,
    autoRenew: 0,
    createdAt: now,
    updatedAt: now,
  });

  try {
    const fs = require('fs');
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  } catch {
    // ignore
  }

  console.log('Seed complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});