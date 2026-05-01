import { Module, Global } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/sql-js';
import * as schema from './schema';

export const DRIZZLE_INSTANCE = 'DRIZZLE_INSTANCE';

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE_INSTANCE,
      useFactory: async () => {
        const initSqlJs = (await import('sql.js')).default;
        const SQL = await initSqlJs();
        const dbPath = process.env['DATABASE_URL'] || './data/gymos.db';
        let db;

        try {
          const fs = require('fs');
          const dbDir = dbPath.substring(0, dbPath.lastIndexOf('/') || dbPath.lastIndexOf('\\'));
          if (dbDir && !fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
          }
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

export type DrizzleInstance = ReturnType<typeof drizzle>;