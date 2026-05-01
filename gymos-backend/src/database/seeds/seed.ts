import initSqlJs from 'sql.js';
import { drizzle } from 'drizzle-orm/sql-js';
import * as fs from 'fs';
import * as schema from '../schema';
import { hashSync } from 'bcryptjs';

const dbPath = process.env['DATABASE_URL'] || './data/gymos.db';

type DemoMember = {
  id: string;
  firstName: string;
  lastName: string;
  documentNumber: string;
  email: string;
  phone: string;
  planId: string;
  membershipId: string;
  membershipStatus: 'active' | 'warning' | 'frozen';
  membershipEndOffsetDays: number;
  frozeUntilOffsetDays?: number;
};

async function seed() {
  console.log('Seeding database...');

  const SQL = await initSqlJs();
  const dbDir = dbPath.substring(0, dbPath.lastIndexOf('/') || dbPath.lastIndexOf('\\'));
  if (dbDir && !fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const db = fs.existsSync(dbPath)
    ? new SQL.Database(fs.readFileSync(dbPath))
    : new SQL.Database();

  const dbDrizzle = drizzle(db, { schema });

  const tenantId = '11111111-1111-1111-1111-111111111111';
  const branchId = '22222222-2222-2222-2222-222222222222';
  const userId = '33333333-3333-3333-3333-333333333333';
  const staffProfileId = '44444444-4444-4444-4444-444444444444';
  const basicPlanId = '55555555-5555-5555-5555-555555555551';
  const premiumPlanId = '55555555-5555-5555-5555-555555555552';
  const vipPlanId = '55555555-5555-5555-5555-555555555553';
  const now = new Date();
  const nowIso = now.toISOString();
  const passwordHash = hashSync('demo1234', 10);

  const members: DemoMember[] = [
    {
      id: '66666666-6666-6666-6666-666666666661',
      firstName: 'Fernando',
      lastName: 'Costas',
      documentNumber: '35412678',
      email: 'fernando.costas@gmail.com',
      phone: '+5491145678900',
      planId: premiumPlanId,
      membershipId: '77777777-7777-7777-7777-777777777771',
      membershipStatus: 'active',
      membershipEndOffsetDays: 28,
    },
    {
      id: '66666666-6666-6666-6666-666666666662',
      firstName: 'Laura',
      lastName: 'Rodriguez',
      documentNumber: '28765432',
      email: 'laura.rodriguez@gmail.com',
      phone: '+5491141111111',
      planId: vipPlanId,
      membershipId: '77777777-7777-7777-7777-777777777772',
      membershipStatus: 'warning',
      membershipEndOffsetDays: 3,
    },
    {
      id: '66666666-6666-6666-6666-666666666663',
      firstName: 'Pablo',
      lastName: 'Mansilla',
      documentNumber: '40123456',
      email: 'pablo.mansilla@gmail.com',
      phone: '+5491142222222',
      planId: premiumPlanId,
      membershipId: '77777777-7777-7777-7777-777777777773',
      membershipStatus: 'active',
      membershipEndOffsetDays: 19,
    },
    {
      id: '66666666-6666-6666-6666-666666666664',
      firstName: 'Ana',
      lastName: 'Soledad',
      documentNumber: '33987654',
      email: 'ana.soledad@gmail.com',
      phone: '+5491143333333',
      planId: basicPlanId,
      membershipId: '77777777-7777-7777-7777-777777777774',
      membershipStatus: 'active',
      membershipEndOffsetDays: -5,
    },
    {
      id: '66666666-6666-6666-6666-666666666665',
      firstName: 'Juan',
      lastName: 'Torres',
      documentNumber: '29456789',
      email: 'juan.torres@gmail.com',
      phone: '+5491144444444',
      planId: basicPlanId,
      membershipId: '77777777-7777-7777-7777-777777777775',
      membershipStatus: 'active',
      membershipEndOffsetDays: 35,
    },
    {
      id: '66666666-6666-6666-6666-666666666666',
      firstName: 'Carla',
      lastName: 'Sanchez',
      documentNumber: '31234567',
      email: 'carla.sanchez@gmail.com',
      phone: '+5491145555555',
      planId: vipPlanId,
      membershipId: '77777777-7777-7777-7777-777777777776',
      membershipStatus: 'active',
      membershipEndOffsetDays: 42,
    },
    {
      id: '66666666-6666-6666-6666-666666666667',
      firstName: 'Martin',
      lastName: 'Gonzalez',
      documentNumber: '27654321',
      email: 'martin.gonzalez@gmail.com',
      phone: '+5491146666666',
      planId: premiumPlanId,
      membershipId: '77777777-7777-7777-7777-777777777777',
      membershipStatus: 'frozen',
      membershipEndOffsetDays: 18,
      frozeUntilOffsetDays: 12,
    },
    {
      id: '66666666-6666-6666-6666-666666666668',
      firstName: 'Julia',
      lastName: 'Ruiz',
      documentNumber: '38765123',
      email: 'julia.ruiz@gmail.com',
      phone: '+5491147777777',
      planId: basicPlanId,
      membershipId: '77777777-7777-7777-7777-777777777778',
      membershipStatus: 'warning',
      membershipEndOffsetDays: 5,
    },
  ];

  const resetStatements = [
    'DELETE FROM reservation_waitlist',
    'DELETE FROM reservations',
    'DELETE FROM class_sessions',
    'DELETE FROM checkins',
    'DELETE FROM checkin_attempts',
    'DELETE FROM payments',
    'DELETE FROM invoice_items',
    'DELETE FROM invoices',
    'DELETE FROM membership_freezes',
    'DELETE FROM membership_changes',
    'DELETE FROM memberships',
    'DELETE FROM plans',
    'DELETE FROM members',
    'DELETE FROM password_reset_tokens',
    'DELETE FROM sessions',
    'DELETE FROM staff_branch_assignments',
    'DELETE FROM staff_profiles',
    'DELETE FROM user_roles',
    'DELETE FROM roles',
    'DELETE FROM branches',
    'DELETE FROM tenants',
    'DELETE FROM users',
    'DELETE FROM audit_logs',
  ];

  for (const statement of resetStatements) {
    db.run(statement);
  }

  await dbDrizzle.insert(schema.tenantsTable).values({
    id: tenantId,
    name: 'GymOS Centro',
    slug: 'gymos-centro',
    contactEmail: 'contacto@gymos.com',
    contactPhone: '+5491140000000',
    timezone: 'America/Argentina/Buenos_Aires',
    isActive: 1,
    createdAt: nowIso,
    updatedAt: nowIso,
  });

  await dbDrizzle.insert(schema.branchesTable).values({
    id: branchId,
    tenantId,
    name: 'Sucursal Centro',
    address: 'Av. Corrientes 1234',
    phone: '+5491140000000',
    isActive: 1,
    openingTime: '06:00',
    closingTime: '22:00',
    createdAt: nowIso,
    updatedAt: nowIso,
  });

  await dbDrizzle.insert(schema.usersTable).values({
    id: userId,
    email: 'maria@gimnasio.com',
    passwordHash,
    isActive: 1,
    createdAt: nowIso,
    updatedAt: nowIso,
  });

  await dbDrizzle.insert(schema.staffProfilesTable).values({
    id: staffProfileId,
    userId,
    tenantId,
    firstName: 'María',
    lastName: 'García',
    phone: '+5491112345679',
    isActive: 1,
    createdAt: nowIso,
    updatedAt: nowIso,
  });

  await dbDrizzle.insert(schema.plansTable).values([
    {
      id: basicPlanId,
      tenantId,
      name: 'Básico',
      description: 'Acceso área de musculación, 1 sucursal',
      priceMonthly: 29900,
      currency: 'ARS',
      durationDays: 30,
      features: JSON.stringify([
        'Acceso área de musculación',
        '1 sucursal',
        'Sin clases grupales',
      ]),
      allowsGroupClasses: 0,
      groupClassesPerMonth: 0,
      allowsAllBranches: 0,
      includesPersonalTraining: 0,
      personalTrainingSessions: 0,
      sortOrder: 1,
      isActive: 1,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: premiumPlanId,
      tenantId,
      name: 'Premium',
      description: 'Acceso total + clases grupales, todas las sucursales',
      priceMonthly: 49900,
      currency: 'ARS',
      durationDays: 30,
      features: JSON.stringify([
        'Acceso total',
        'Todas las sucursales',
        '4 clases grupales/mes',
      ]),
      allowsGroupClasses: 1,
      groupClassesPerMonth: 4,
      allowsAllBranches: 1,
      includesPersonalTraining: 0,
      personalTrainingSessions: 0,
      sortOrder: 2,
      isActive: 1,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: vipPlanId,
      tenantId,
      name: 'VIP',
      description: 'Acceso total + ilimitado + sesión PT mensual',
      priceMonthly: 79900,
      currency: 'ARS',
      durationDays: 30,
      features: JSON.stringify([
        'Acceso total',
        'Clases ilimitadas',
        '1 sesión PT/mes',
      ]),
      allowsGroupClasses: 1,
      groupClassesPerMonth: 999,
      allowsAllBranches: 1,
      includesPersonalTraining: 1,
      personalTrainingSessions: 1,
      sortOrder: 3,
      isActive: 1,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
  ]);

  await dbDrizzle.insert(schema.membersTable).values(
    members.map((member, index) => ({
      id: member.id,
      tenantId,
      firstName: member.firstName,
      lastName: member.lastName,
      documentType: 'DNI',
      documentNumber: member.documentNumber,
      email: member.email,
      phone: member.phone,
      phoneNormalized: member.phone.replace(/\D/g, ''),
      notes: index === 0 ? 'Socio frecuente de clases grupales' : null,
      isActive: 1,
      createdAt: new Date(now.getTime() - (index + 3) * 86400000).toISOString(),
      updatedAt: nowIso,
    })),
  );

  await dbDrizzle.insert(schema.membershipsTable).values(
    members.map((member, index) => {
      const startDate = new Date(now.getTime() - (index + 25) * 86400000);
      const endDate = new Date(now.getTime() + member.membershipEndOffsetDays * 86400000);
      const values: Record<string, unknown> = {
        id: member.membershipId,
        memberId: member.id,
        planId: member.planId,
        tenantId,
        status: member.membershipStatus,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        autoRenew: member.planId !== basicPlanId ? 1 : 0,
        createdAt: startDate.toISOString(),
        updatedAt: nowIso,
      };

      if (member.membershipStatus === 'frozen') {
        values.frozeAt = nowIso;
        values.frozeUntil = new Date(
          now.getTime() + (member.frozeUntilOffsetDays || 10) * 86400000,
        ).toISOString();
      }

      return values;
    }) as any,
  );

  await dbDrizzle.insert(schema.membershipFreezesTable).values({
    id: '88888888-8888-8888-8888-888888888888',
    membershipId: '77777777-7777-7777-7777-777777777777',
    tenantId,
    startedAt: nowIso,
    endsAt: new Date(now.getTime() + 12 * 86400000).toISOString(),
    originalEndDate: new Date(now.getTime() + 18 * 86400000).toISOString(),
    reason: 'Vacaciones',
    createdAt: nowIso,
  });

  const invoiceRows = members.slice(0, 4).flatMap((member, index) => {
    const amount = member.planId === vipPlanId ? 79900 : member.planId === premiumPlanId ? 49900 : 29900;
    const firstInvoiceId = `99999999-9999-9999-9999-99999999999${index + 1}`;
    const secondInvoiceId = `99999999-9999-9999-9999-99999999998${index + 1}`;
    return [
      {
        id: firstInvoiceId,
        memberId: member.id,
        membershipId: member.membershipId,
        tenantId,
        invoiceNumber: `A-000${index + 1}`,
        status: 'paid',
        subtotal: amount,
        discount: 0,
        total: amount,
        dueDate: new Date(now.getTime() - 20 * 86400000).toISOString(),
        paidAt: new Date(now.getTime() - 18 * 86400000).toISOString(),
        paymentMethod: 'Débito',
        notes: 'Renovación automática',
        createdAt: new Date(now.getTime() - 22 * 86400000).toISOString(),
        updatedAt: new Date(now.getTime() - 18 * 86400000).toISOString(),
      },
      {
        id: secondInvoiceId,
        memberId: member.id,
        membershipId: member.membershipId,
        tenantId,
        invoiceNumber: `A-100${index + 1}`,
        status: index === 2 ? 'pending' : 'paid',
        subtotal: amount,
        discount: 0,
        total: amount,
        dueDate: new Date(now.getTime() + 7 * 86400000).toISOString(),
        paidAt: index === 2 ? null : new Date(now.getTime() - 2 * 86400000).toISOString(),
        paymentMethod: 'Débito',
        notes: index === 2 ? 'Pendiente de cobro' : 'Pago confirmado',
        createdAt: new Date(now.getTime() - 4 * 86400000).toISOString(),
        updatedAt: new Date(now.getTime() - 2 * 86400000).toISOString(),
      },
    ];
  });

  await dbDrizzle.insert(schema.invoicesTable).values(invoiceRows);

  await dbDrizzle.insert(schema.invoiceItemsTable).values(
    invoiceRows.map((invoice, index) => ({
      id: `10101010-1010-1010-1010-1010101010${index}`,
      invoiceId: invoice.id,
      description: `Membresía ${index % 3 === 0 ? 'Premium' : 'Mensual'}`,
      quantity: 1,
      unitPrice: invoice.total,
      total: invoice.total,
    })),
  );

  await dbDrizzle.insert(schema.paymentsTable).values(
    invoiceRows
      .filter((invoice) => invoice.status === 'paid')
      .map((invoice, index) => ({
        id: `20202020-2020-2020-2020-2020202020${index}`,
        invoiceId: invoice.id,
        memberId: invoice.memberId,
        tenantId,
        amount: invoice.total,
        currency: 'ARS',
        method: 'Débito',
        status: 'completed',
        transactionRef: `TRX-${index + 1}`,
        processedAt: invoice.paidAt || nowIso,
        createdAt: invoice.paidAt || nowIso,
      })),
  );

  const checkinOffsets = [
    { memberId: members[0].id, hour: 8, minute: 47, type: 'Spinning 8:00' },
    { memberId: members[1].id, hour: 8, minute: 31, type: 'Yoga 9:00' },
    { memberId: members[2].id, hour: 8, minute: 15, type: 'Musculación' },
    { memberId: members[4].id, hour: 8, minute: 3, type: 'Acceso libre' },
    { memberId: members[5].id, hour: 7, minute: 42, type: 'HIIT 8:30' },
    { memberId: members[0].id, hour: 19, minute: 10, type: 'Musculación' },
    { memberId: members[2].id, hour: 18, minute: 4, type: 'Acceso libre' },
    { memberId: members[7].id, hour: 17, minute: 22, type: 'Spinning 8:00' },
  ];

  await dbDrizzle.insert(schema.checkinsTable).values(
    checkinOffsets.map((item, index) => {
      const checkinDate = new Date();
      checkinDate.setHours(item.hour, item.minute, 0, 0);
      return {
        id: `30303030-3030-3030-3030-3030303030${index}`,
        memberId: item.memberId,
        membershipId: members.find((member) => member.id === item.memberId)?.membershipId,
        branchId,
        tenantId,
        checkinType: item.type,
        createdAt: checkinDate.toISOString(),
      };
    }),
  );

  await dbDrizzle.insert(schema.auditLogsTable).values({
    id: '40404040-4040-4040-4040-404040404040',
    tenantId,
    userId,
    action: 'seed.completed',
    entityType: 'database',
    entityId: tenantId,
    metadata: JSON.stringify({ members: members.length }),
    createdAt: nowIso,
  });

  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));

  console.log('Seed complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
