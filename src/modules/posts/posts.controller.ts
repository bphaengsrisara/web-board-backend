import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Req,
  ForbiddenException,
  NotFoundException,
  Logger,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthenticatedRequest, PostWithChildren } from 'src/interfaces';

@Controller('posts')
@ApiTags('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}
  private readonly logger = new Logger(PostsController.name);

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new post' })
  @ApiBody({ type: CreatePostDto })
  @ApiResponse({ status: 201, description: 'Post created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() createPostDto: CreatePostDto,
  ) {
    try {
      const { userId } = req.user;
      return await this.postsService.create(createPostDto, userId);
    } catch (error) {
      this.logger.error('Error creating post', error);
      throw error;
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Get all posts',
    description:
      'Retrieve all posts with optional filtering by topic and search term',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved posts with their associated topics.',
  })
  @ApiQuery({
    name: 'topicId',
    required: false,
    type: String,
    description: 'Filter posts by topic ID',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search posts by title or content',
  })
  async findAll(
    @Query('topicId') topicId?: string,
    @Query('search') search?: string,
  ) {
    try {
      return await this.postsService.findAll(undefined, topicId, search);
    } catch (error) {
      this.logger.error('Error finding all posts', error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-posts')
  @ApiOperation({ summary: 'Get all posts by the authenticated user' })
  @ApiResponse({ status: 200, description: 'Return all posts by the user.' })
  @ApiQuery({ name: 'topicId', required: false, type: String })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search in title and content',
  })
  async findAllMyPosts(
    @Req() req: AuthenticatedRequest,
    @Query('topicId') topicId?: string,
    @Query('search') search?: string,
  ) {
    try {
      const { userId } = req.user;
      return await this.postsService.findAll(userId, topicId, search);
    } catch (error) {
      this.logger.error('Error finding user posts', error);
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a post by ID' })
  @ApiResponse({ status: 200, description: 'Return a single post.' })
  @ApiResponse({ status: 404, description: 'Post not found.' })
  async findOne(@Param('id') id: string) {
    try {
      return await this.checkExists(id);
    } catch (error) {
      this.logger.error(`Error finding post with id ${id}`, error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a post by ID' })
  @ApiBody({ type: UpdatePostDto })
  @ApiResponse({ status: 200, description: 'Post updated successfully.' })
  @ApiResponse({ status: 404, description: 'Post not found.' })
  async update(
    @Req() req: AuthenticatedRequest,
    @Body() updatePostDto: UpdatePostDto,
    @Param('id') id: string,
  ) {
    try {
      const post = await this.checkExists(id);
      await this.checkOwnership(req, post);
      return await this.postsService.update(id, updatePostDto);
    } catch (error) {
      this.logger.error(`Error updating post with id ${id}`, error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a post by ID' })
  @ApiResponse({ status: 200, description: 'Post deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Post not found.' })
  async remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    try {
      const post = await this.checkExists(id);
      await this.checkOwnership(req, post);
      return await this.postsService.remove(id);
    } catch (error) {
      this.logger.error(`Error deleting post with id ${id}`, error);
      throw error;
    }
  }

  async checkExists(postId: string): Promise<PostWithChildren> {
    try {
      const post = await this.postsService.findOne(postId);
      if (!post) {
        throw new NotFoundException('Post not found');
      }
      return post;
    } catch (error) {
      this.logger.error(
        `Error checking post existence with id ${postId}`,
        error,
      );
      throw error;
    }
  }

  async checkOwnership(req: AuthenticatedRequest, post: PostWithChildren) {
    try {
      const { userId } = req.user;
      if (post?.authorId !== userId) {
        throw new ForbiddenException('You do not own this post');
      }
    } catch (error) {
      this.logger.error('Error checking post ownership', error);
      throw error;
    }
  }
}
