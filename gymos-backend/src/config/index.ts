export interface AppConfig {
  env: string;
  port: number;
  corsOrigins: string[];
  database: {
    url: string;
  };
  jwt: {
    secret: string;
    accessTokenTtl: string;
    refreshTokenTtl: string;
  };
  argon: {
    saltLength: number;
  };
}

export type Environment = 'development' | 'staging' | 'production';

export interface RequestContext {
  requestId: string;
  tenantId: string | null;
  userId: string | null;
  branchId: string | null;
}

export interface PaginationParams {
  cursor?: string;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  nextCursor?: string;
  total?: number;
}