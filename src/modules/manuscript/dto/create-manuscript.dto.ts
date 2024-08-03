import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';


export class CreateManuscriptDto {
  @ApiProperty({ example: 'A Comprehensive Study on AI', description: 'The title of the manuscript' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'This study explores the advancements in AI...', description: 'The abstract of the manuscript' })
  @IsString()
  @IsNotEmpty()
  abstract: string;

  @ApiProperty({ example: 'AI, Machine Learning, Deep Learning', description: 'Keywords for the manuscript' })
  @IsString()
  @IsNotEmpty()
  keywords: string;

  @ApiProperty({ example: 'Prof Nasir', description: 'If you have any suggestion on who to review your manuscript' })
  @IsString()
  suggestedReviewer: string;

  @ApiProperty({ example: 'https://example.com/manuscript.pdf', description: 'Link to where the document is uploaded' })
  @IsString()
  @IsNotEmpty()
  manuscriptLink: string;

  @ApiProperty({ example: 'https://example.com/payment-receipt.pdf', description: 'Link to locate the payment receipt' })
  @IsString()
  @IsNotEmpty()
  proofofPayment: string;

  @ApiProperty({ example: 'https://example.com/otherDocsLink.pdf', description: 'Link to locate the other Docs  e. latex or formular' })
  @IsString()
  @IsNotEmpty()
  otherDocsLink : string;
}
