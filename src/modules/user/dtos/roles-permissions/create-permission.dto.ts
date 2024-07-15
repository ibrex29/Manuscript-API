import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePermissionDto {
  @IsNotEmpty()
  @IsString()
  permissionName: string;

  @IsString()
  createdBy: string;

  @IsString()
  updatedBy: string;
}
