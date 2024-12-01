import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedRequest } from 'src/interfaces';
import { PostsService } from '../posts/posts.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@Controller('comments')
@ApiTags('comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly postsService: PostsService,
  ) {}
  private readonly logger = new Logger(CommentsController.name);

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new comment' })
  @ApiBody({ type: CreateCommentDto })
  @ApiResponse({ status: 201, description: 'Comment created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 404, description: 'Post not found.' })
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    try {
      const { userId } = req.user;
      const post = await this.postsService.findOne(createCommentDto.postId);

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      return await this.commentsService.create(createCommentDto, userId);
    } catch (error) {
      this.logger.error('Error creating comment', error);
      throw error;
    }
  }
}
