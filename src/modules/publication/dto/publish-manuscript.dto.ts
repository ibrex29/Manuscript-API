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
    example: '1',
    description: 'The issue number of the manuscript',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  issue: string;

  @ApiProperty({
    example: '14',
    description: 'The volume number of the manuscript',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  volume: string;

  
  @ApiProperty({
    example: 'https://doi.org/10.56471/slujst.v7i.486',
    description: 'The Digital Object Identifier (DOI) of the manuscript',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  doi: string;


  @ApiProperty({
    example: 'http://example.com/formatted-manuscript.pdf',
    description: 'The link to the formatted manuscript',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  formattedManuscript: string;
}
