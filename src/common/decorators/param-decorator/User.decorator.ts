// src/common/decorators/param-decorator/User.decorator.ts

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user; // Assuming user information is stored in `request.user`

    if (data) {
      return user ? user[data] : undefined;
    }
    return user;
  },
);