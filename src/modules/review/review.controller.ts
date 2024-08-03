import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request
} from '@nestjs/common';
import { ReviewService } from './review.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger';
import { Public, Role } from 'src/common/constants/routes.constant';
import { Recommendation, Reply } from '@prisma/client';
import { RolesGuard } from 'src/modules/auth/guard/role.guard';
import { UserType } from 'src/modules/user/types/user.type';
import { CreateReviewDto } from './dto/create-review.dto';
import { AcceptRejectManuscriptDto } from './dto/accept-reject-manuscript.dto';


@ApiBearerAuth()
@ApiTags('review')
@UseGuards(RolesGuard)
@Controller({ path: 'review', version: '1' })
@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}


  @Role(UserType.REVIEWER)
  @Get('assigned-manuscript')
  @ApiOperation({ summary: 'Get assigned manuscripts for the logged-in reviewer' })
  async getassignedManuscriptsForLoggedInUser(@Request() req) {
    return this.reviewService.getManuscriptsAssignedForLoggedInUser(req.user?.userId);
  }
@Public()
  @Get('recommendations')
  @ApiOperation({ summary: 'Get all possible recommendations' })
  @ApiResponse({ status: 200, description: 'Recommendations fetched successfully' })
  getAllRecommendations(): Recommendation[] {
    return this.reviewService.getAllRecommendations();
  }

  @Post('create-review')
  @Role(UserType.REVIEWER)
  @ApiOperation({ summary: 'Create a review for a manuscript' })
  async createReview(@Request() req, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewService.createReview(req.user?.userId, createReviewDto);
  }

  @Role(UserType.REVIEWER)
  @Get('all-review')
  @ApiOperation({ summary: 'Get all reviews' })
  async getAllReviews() {
    return this.reviewService.getAllReviews();
  }


  @Public()
  @Get('review/:reviewId')
  @ApiOperation({ summary: 'Get all replies for a specific review' })
  @ApiResponse({ status: 200, description: 'Replies retrieved successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getRepliesByReview(@Param('reviewId') reviewId: string): Promise<Reply[]> {
    return this.reviewService.getRepliesForReview(reviewId);
  }

  @Post('review')
  @Role(UserType.REVIEWER)
  @ApiOperation({ summary: 'Accept or reject a manuscript' })
  @ApiOkResponse({ description: 'The manuscript has been successfully accepted or rejected.' })
  @ApiBody({ type: AcceptRejectManuscriptDto })
  async acceptOrRejectManuscript(@Request() req, @Body() acceptRejectManuscriptDto: AcceptRejectManuscriptDto) {
    return this.reviewService.acceptOrRejectManuscript(req.user?.userId, acceptRejectManuscriptDto);
  }
  
}
