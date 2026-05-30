import * as schema from './schema';

export * from './schema';
export type { DrizzleInstance } from './database.module';
export { persistDatabase } from './database.module';

export const getDatabaseSchema = () => schema;
