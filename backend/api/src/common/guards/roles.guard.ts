import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // Check if user has role object (from eager loading)
    if (!user || !user.role) {
      return false;
    }

    // Check if user's role matches any required role
    // Also check for wildcard permission for admin role
    return (
      requiredRoles.some((roleName) => user.role.name === roleName) ||
      user.role.permissions?.['*'] === true
    );
  }
}
