import { UseGuards,Request, Controller, Body, Post, Get } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ReplyService } from "./reply.service";
import { RolesGuard } from "../auth/guard/role.guard";
import { CreateReplyDto } from "./dto/reply.dto";
import { Review } from "@prisma/client";
import { Role } from "src/common/constants/routes.constant";
import { UserType } from "../user/types/user.type";


@ApiBearerAuth()
@ApiTags('reply')
@UseGuards(RolesGuard)
@Controller({ path: 'reply', version: '1' })
@Controller('review')
export class ReplyController {
  constructor(private readonly replyService: ReplyService) {}

  @Role(UserType.AUTHOR)
  @Get('review-message')
  @ApiOperation({ summary: 'view reviews for manuscripts submitted by the logged-in author' })
  @ApiResponse({
    status: 200,
    description: 'Reviews retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  async getReviewsByAuthor(@Request() req): Promise<Review[]> {
    return this.replyService.getReviewsByAuthor(req.user.userId);
  }

  @Post("reply")
  @ApiOperation({ summary: 'Create a reply to a review' })
  @ApiResponse({ status: 201, description: 'Reply created successfully' })
  async createReply(
    @Request() req,
    @Body() createReplyDto: CreateReplyDto) {
    return this.replyService.createReply(req.user?.userId, createReplyDto);
  }



}