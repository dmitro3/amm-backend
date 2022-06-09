import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Role } from 'src/modules/roles/enums/role.enum';

@Injectable()
export class RolesGuardAdmin implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (![Role.Admin, Role.SuperAdmin].includes(user.role)) {
      throw new HttpException({ key: 'user.NOT_ADMIN' }, HttpStatus.FORBIDDEN);
    }
    return [Role.Admin, Role.SuperAdmin].includes(user.role);
  }
}
