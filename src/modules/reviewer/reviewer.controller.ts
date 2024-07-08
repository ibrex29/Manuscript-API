import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards,Request } from '@nestjs/common';
import { ReviewerService } from './reviewer.service';
import { CreateReviewerDto } from './dto/create-reviewer.dto';
import { UpdateReviewerDto } from './dto/update-reviewer.dto';
import { ApiBearerAuth, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse,ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public,Role } from 'src/common/constants/routes.constant';
import { Reply, Reviewer } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/modules/auth/guard/role.guard';
import { UserType } from 'src/modules/user/types/user.type';
import { CreateReviewDto } from './dto/create-review.dto';
import { AcceptRejectManuscriptDto } from './dto/accept-reject-manuscript.dto';



@ApiBearerAuth()
@ApiTags('reviewer')
@UseGuards(RolesGuard)
@Controller({ path: 'reviewer', version: '1' }) 
@Controller('reviewer')
export class ReviewerController {
  constructor(private readonly reviewerService: ReviewerService) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createReviewerDto: CreateReviewerDto) {
    return this.reviewerService.createReviewer(createReviewerDto);
  }

  @Public()
  @Get("")
  findAll() {
    return this.reviewerService.findAll();
  }

  @Public()
  @Get("all-review")
  async getAllReviews() {
    return this.reviewerService.getAllReviews();
  }

  


  // @Get(':id')
  // @ApiOperation({ summary: 'Get a reviewer by ID' })
  // @ApiParam({
  //   name: 'id',
  //   type: String,
  //   description: 'Unique identifier of the reviewer',
  // })
  // @ApiNotFoundResponse({
  //   description: 'Reviewer not found',
  // })
  // @ApiInternalServerErrorResponse({
  //   description: 'Internal server error',
  // })

  // async findOne(@Param('id') id: string): Promise<Reviewer> {
  //   return this.reviewerService.findOne(id);
  // }
  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateReviewerDto: UpdateReviewerDto) {
  //   return this.reviewerService.update(+id, updateReviewerDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.reviewerService.remove(+id);
  // }


  @Role(UserType.REVIEWER)
  @Get('assigned-manuscript')
  async getassignedManuscriptsForLoggedInUser(
    @Request() req) {
    return this.reviewerService.getManuscriptsAssignedForLoggedInUser(req.user?.userId);
  }
  @Post("create-review")
  @Role(UserType.REVIEWER)
  async createReview(
    @Request() req, 
    @Body() createReviewDto: CreateReviewDto) {
    return this.reviewerService.createReview(
      req.user?.userId, 
      createReviewDto);
  }

  @Public()
  @Get('review/:reviewId')
  @ApiOperation({ summary: 'Get all replies for a specific review' })
  @ApiResponse({
    status: 200,
    description: 'Replies retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  async getRepliesByReview(@Param('reviewId') reviewId: string): Promise<Reply[]> {
    return this.reviewerService.getRepliesForReview(reviewId);
  }


  @Post('review')
  @Role(UserType.REVIEWER)  // Only a reviewer can accept or reject a manuscript
  @ApiOperation({ summary: 'Accept or reject a manuscript' })
  @ApiOkResponse({ description: 'The manuscript has been successfully accepted or rejected.' })
  @ApiBody({ type: AcceptRejectManuscriptDto })
  async acceptOrRejectManuscript(
    @Request() req,
    @Body() acceptRejectManuscriptDto: AcceptRejectManuscriptDto
  ) {
    return this.reviewerService.acceptOrRejectManuscript(req.user?.userId, acceptRejectManuscriptDto);
  }
}
 
