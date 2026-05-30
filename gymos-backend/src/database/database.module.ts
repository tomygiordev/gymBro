import { Module, Global } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/sql-js';
import * as fs from 'fs';
import * as path from 'path';
import * as schema from './schema';

export const DRIZZLE_INSTANCE = 'DRIZZLE_INSTANCE';

export type DrizzleInstance = ReturnType<typeof drizzle>;

const getDatabasePath = () => process.env['DATABASE_URL'] || './data/gymos.db';

const ensureDatabaseDirectory = (dbPath: string) => {
  if (!dbPath || dbPath === ':memory:') {
    return;
  }

  const dbDir = path.dirname(dbPath);
  if (dbDir && dbDir !== '.' && !fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
};

export const persistDatabase = (db: DrizzleInstance): void => {
  const dbPath = getDatabasePath();
  if (!dbPath || dbPath === ':memory:') {
    return;
  }

  const client = (db as unknown as { session?: { client?: { export: () => Uint8Array } } })
    .session?.client;

  if (!client) {
    throw new Error('Unable to persist database: SQL.js client not available');
  }

  ensureDatabaseDirectory(dbPath);
  fs.writeFileSync(dbPath, Buffer.from(client.export()));
};

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE_INSTANCE,
      useFactory: async () => {
        const initSqlJs = (await import('sql.js')).default;
        const SQL = await initSqlJs();
        const dbPath = getDatabasePath();
        let db;

        try {
          ensureDatabaseDirectory(dbPath);
          if (fs.existsSync(dbPath)) {
            const fileBuffer = fs.readFileSync(dbPath);
            db = new SQL.Database(fileBuffer);
          } else {
            db = new SQL.Database();
          }
        } catch {
          db = new SQL.Database();
        }

        return drizzle(db, { schema });
      },
    },
  ],
  exports: [DRIZZLE_INSTANCE],
})
export class DatabaseModule {}
