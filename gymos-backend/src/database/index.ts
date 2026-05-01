import * as schema from './schema';
import { DrizzleInstance } from './database.module';

export * from './schema';
export { DrizzleInstance };

export const getDatabaseSchema = () => schema;