import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

interface RequestWithUser {
  user?: {
    id: string;
    email: string;
    role: 'employee' | 'tourist';
    name: string;
  };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<
      ('employee' | 'tourist')[]
    >(ROLES_KEY, [context.getHandler(), context.getClass()]);
    if (!requiredRoles) {
      return true;
    }
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        'Akses ditolak: Anda tidak memiliki wewenang untuk aksi ini',
      );
    }
    return true;
  }
}
