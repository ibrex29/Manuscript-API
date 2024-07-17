import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PublishManuscriptDto {
  @ApiProperty({
    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
    description: 'The unique identifier of the manuscript',
  })
  @IsString()
  @IsNotEmpty()
  manuscriptId: string;

  @ApiProperty({
    example: 'The Impact of AI on Modern Society',
    description: 'The title of the manuscript',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    example: 'This study explores the various impacts of artificial intelligence on modern society...',
    description: 'The abstract of the manuscript',
  })
  @IsNotEmpty()
  @IsString()
  abstract: string;

  @ApiProperty({
    example: 'AI, society, technology, future',
    description: 'Keywords associated with the manuscript',
  })
  @IsNotEmpty()
  @IsString()
  keywords: string;

  @ApiProperty({
    example: 'http://example.com/formatted-manuscript.pdf',
    description: 'The link to the formatted manuscript',
    required: false,
  })
  @IsOptional()
  @IsString()
  formattedManuscript?: string;
}
