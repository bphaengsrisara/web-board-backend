import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  NotFoundException,
  Logger,
  Patch,
  Param,
  Delete,
  ForbiddenException,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedRequest } from 'src/interfaces';
import { PostsService } from '../posts/posts.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Comment } from '@prisma/client';

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

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a comment' })
  @ApiBody({ type: UpdateCommentDto })
  @ApiResponse({ status: 200, description: 'Comment updated successfully.' })
  @ApiResponse({ status: 404, description: 'Comment not found.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not the comment owner.',
  })
  async update(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    try {
      const comment = await this.checkExists(id);
      await this.checkOwnership(req, comment);
      return await this.commentsService.update(id, updateCommentDto);
    } catch (error) {
      this.logger.error(`Error updating comment with id ${id}`, error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiResponse({ status: 200, description: 'Comment deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Comment not found.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not the comment owner.',
  })
  async remove(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    try {
      const comment = await this.checkExists(id);
      await this.checkOwnership(req, comment);
      return await this.commentsService.remove(id);
    } catch (error) {
      this.logger.error(`Error deleting comment with id ${id}`, error);
      throw error;
    }
  }

  private async checkExists(commentId: string): Promise<Comment> {
    const comment = await this.commentsService.findOne(commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    return comment;
  }

  private async checkOwnership(req: AuthenticatedRequest, comment: Comment) {
    const { userId } = req.user;
    if (comment.authorId !== userId) {
      throw new ForbiddenException('You do not own this comment');
    }
  }
}
