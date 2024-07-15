import { ApiProperty } from '@nestjs/swagger';

export class VerifyTokenDto {
  @ApiProperty({
    description: 'The token to be verified',
    example: '0x4c4c4544',
  })
  token: string;
}
