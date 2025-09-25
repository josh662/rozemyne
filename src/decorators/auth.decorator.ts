import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/guards';

export function Auth() {
  return applyDecorators(UseGuards(AuthGuard));
}

export function Admin() {
  return applyDecorators(
    SetMetadata('adminConfig', { isAdmin: true }),
    UseGuards(AuthGuard),
  );
}
