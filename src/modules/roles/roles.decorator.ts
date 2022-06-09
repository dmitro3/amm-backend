import { CustomDecorator } from '@nestjs/common';
import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/modules/roles/enums/role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]): CustomDecorator<string> => SetMetadata(ROLES_KEY, roles);
