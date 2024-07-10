import { ApiProperty } from '@nestjs/swagger';
import {  IsNotEmpty, IsUUID } from 'class-validator';

export class PublishManuscriptDto {
  @ApiProperty({
    example: 'd7a9e15d-3b22-45f8-96c2-0ed78d4f85d4',
    description: 'The unique identifier of the manuscript being reviewed',
  })
  @IsUUID()
  @IsNotEmpty()
  manuscriptId: string;

}
