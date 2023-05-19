import { HaveRoleGuard } from './role.guard';

export class IsAdminGuard extends HaveRoleGuard {
  constructor() {
    super('ADMIN');
  }
}
