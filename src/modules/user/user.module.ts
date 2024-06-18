import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { UserService } from './user.service';
import { PrismaService } from 'prisma/prisma.service';
import { CryptoService } from 'src/common/crypto/crypto.service';
// import { RolesPermissionsService } from 'src/modules/services/roles-permissions.service';
import { PrismaModule } from 'prisma/prisma.module';
// import { RolesPermissionsController } from './controllers/roles-permissions.controller';


@Module({
  imports: [PrismaModule],
  controllers: [
    UserController,
    // RolesPermissionsController,
    
    // RolesPermissionsController,
  ],
  providers: [
    UserService,
    PrismaService,
    CryptoService,
    // RolesPermissionsService,
  ],
  exports: [
    UserService,
    // RolesPermissionsService,
    CryptoService,
    // RolesPermissionsService,

  ],
})
export class UserModule {}
