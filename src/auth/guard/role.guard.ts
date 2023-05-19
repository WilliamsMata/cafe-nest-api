import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';

@Injectable()
export class HaveRoleGuard implements CanActivate {
  constructor(private readonly role: Role) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return user && user.role === this.role;
  }
}
