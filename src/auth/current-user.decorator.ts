import { createParamDecorator, ExecutionContext } from '@nestjs/common';

interface RequestWithUser {
  user: {
    id: string;
    email: string;
    role: 'employee' | 'tourist';
    name: string;
  };
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  },
);
