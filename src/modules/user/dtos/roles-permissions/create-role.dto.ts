import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRoleDto {
  @IsNotEmpty()
  @IsString({ each: true })
  roleName: string;

  @IsOptional()
  @IsString()
  description: string;
}
