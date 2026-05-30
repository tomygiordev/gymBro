export interface TenantContext {
  tenantId: string;
  userId: string;
  branchId?: string;
}

export interface AuthPayload {
  sub: string;
  email: string;
  tenantId: string;
  branchId?: string;
  role: string;
  iat: number;
  exp: number;
}

export interface RefreshTokenPayload {
  sub: string;
  type: 'refresh';
  jti?: string;
  iat: number;
  exp: number;
}

export interface RequestWithContext {
  user?: AuthPayload;
  tenantContext?: TenantContext;
  requestId: string;
}
