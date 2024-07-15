import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request
} from '@nestjs/common';
import { ReviewerService } from './reviewer.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger';
import { Public, Role } from 'src/common/constants/routes.constant';
import { Reply } from '@prisma/client';
import { RolesGuard } from 'src/modules/auth/guard/role.guard';
import { UserType } from 'src/modules/user/types/user.type';
import { CreateReviewDto } from './dto/create-review.dto';
import { AcceptRejectManuscriptDto } from './dto/accept-reject-manuscript.dto';
import { CreateReviewerDto } from './dto/create-reviewer.dto';

@ApiBearerAuth()
@ApiTags('reviewer')
@UseGuards(RolesGuard)
@Controller({ path: 'reviewer', version: '1' })
@Controller('reviewer')
export class ReviewerController {
  constructor(private readonly reviewerService: ReviewerService) {}

  @Role(UserType.EDITOR)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new reviewer' })
  create(@Body() createReviewerDto: CreateReviewerDto) {
    return this.reviewerService.createReviewer(createReviewerDto);
  }

  @Public()
  @Get('')
  @ApiOperation({ summary: 'Find all reviewers' })
  findAll() {
    return this.reviewerService.findAll();
  }

  @Public()
  @Get('all-review')
  @ApiOperation({ summary: 'Get all reviews' })
  async getAllReviews() {
    return this.reviewerService.getAllReviews();
  }

  @Role(UserType.REVIEWER)
  @Get('assigned-manuscript')
  @ApiOperation({ summary: 'Get assigned manuscripts for the logged-in reviewer' })
  async getassignedManuscriptsForLoggedInUser(@Request() req) {
    return this.reviewerService.getManuscriptsAssignedForLoggedInUser(req.user?.userId);
  }

  @Post('create-review')
  @Role(UserType.REVIEWER)
  @ApiOperation({ summary: 'Create a review for a manuscript' })
  async createReview(@Request() req, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewerService.createReview(req.user?.userId, createReviewDto);
  }

  @Public()
  @Get('review/:reviewId')
  @ApiOperation({ summary: 'Get all replies for a specific review' })
  @ApiResponse({ status: 200, description: 'Replies retrieved successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getRepliesByReview(@Param('reviewId') reviewId: string): Promise<Reply[]> {
    return this.reviewerService.getRepliesForReview(reviewId);
  }

  @Post('review')
  @Role(UserType.REVIEWER)
  @ApiOperation({ summary: 'Accept or reject a manuscript' })
  @ApiOkResponse({ description: 'The manuscript has been successfully accepted or rejected.' })
  @ApiBody({ type: AcceptRejectManuscriptDto })
  async acceptOrRejectManuscript(@Request() req, @Body() acceptRejectManuscriptDto: AcceptRejectManuscriptDto) {
    return this.reviewerService.acceptOrRejectManuscript(req.user?.userId, acceptRejectManuscriptDto);
  }
  
}
