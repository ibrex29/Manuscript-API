import { Request,Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { PublicationService } from './publication.service';
import { Public, Role } from 'src/common/constants/routes.constant';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PublishManuscriptDto } from './dto/publish-manuscript.dto';
import { UserType } from '../user/types/user.type';
import { RolesGuard } from '../auth/guard/role.guard';
import { Manuscript } from '@prisma/client';
// import { Manuscript, Manuscript } from '../manuscript/entities/manuscript.entity';


@ApiBearerAuth()
@ApiTags('publication')
@UseGuards(RolesGuard)
@Public()
@Controller({ path: 'publication', version: '1' })
@Controller('publication')
export class PublicationController {
  constructor(private readonly publicationService: PublicationService) {}


  @Get('accepted')
  @ApiOperation({ summary: 'Get all accepted manuscripts' })
  @ApiResponse({ status: 200, description: 'List of manuscripts accepted and ready to be manuscripts.' }) // Adjust the type as necessary
  @ApiResponse({ status: 404, description: 'No accepted manuscripts found.' })
  async getAcceptedManuscripts(): Promise<Manuscript[]> {
    return this.publicationService.getAcceptedManuscripts();
  }

  @Post('publish')
  @Role(UserType.EDITOR_IN_CHIEF,UserType.PRODUCTION_EDITOR)
  @ApiOperation({ summary: 'Publish a manuscript' })
  @ApiResponse({ status: 200, description: 'Manuscript published successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data or manuscript status not ACCEPTED.' })
  async publishManuscript(
  @Request() req,
  @Body() publishManuscriptDto: PublishManuscriptDto) {
    return this.publicationService.publishManuscript(publishManuscriptDto, req.user?.userId);
  }

  @Public()
  @ApiOperation({ summary: 'list of Published manuscripts ' })
  @ApiResponse({
    status: 200,
    description: 'Published Manuscripts retreived successfully.',
  })
  @Get('manuscripts/published')
  async getAllPublishedManuscripts() {
    return this.publicationService.getAllPublishedManuscripts();
  }
}
