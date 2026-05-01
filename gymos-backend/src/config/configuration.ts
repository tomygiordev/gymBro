import { AppConfig } from './index';

export const configuration = (): AppConfig => ({
  env: process.env['NODE_ENV'] || 'development',
  port: parseInt(process.env['PORT'] || '3000', 10),
  corsOrigins: process.env['CORS_ORIGINS']?.split(',') || ['*'],
  database: {
    url: process.env['DATABASE_URL'] || './data/gymos.db',
  },
  jwt: {
    secret: process.env['JWT_SECRET'] || 'change-me-in-production',
    accessTokenTtl: process.env['JWT_ACCESS_TTL'] || '15m',
    refreshTokenTtl: process.env['JWT_REFRESH_TTL'] || '7d',
  },
  argon: {
    saltLength: parseInt(process.env['ARGON_SALT_LENGTH'] || '3', 10),
  },
});