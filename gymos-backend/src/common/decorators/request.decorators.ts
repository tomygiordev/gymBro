import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithContext } from '../../shared/types';

export const CurrentUser = createParamDecorator(
  (data: keyof string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithContext>();
    const user = request.user;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);

export const TenantId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithContext>();
    return request.user?.tenantId || request.tenantContext?.tenantId;
  },
);

export const RequestId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ requestId: string }>();
    return request.requestId;
  },
);