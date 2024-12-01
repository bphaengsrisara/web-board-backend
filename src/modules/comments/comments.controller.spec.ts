import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { Comment, Post, User } from '@prisma/client';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Logger, NotFoundException } from '@nestjs/common';
import { PostsService } from '../posts/posts.service';
import { AuthenticatedRequest } from 'src/interfaces';

describe('CommentsController', () => {
  let controller: CommentsController;
  let mockLogger: { error: jest.Mock };

  const mockUser: User = {
    id: 'user1',
    username: 'testuser',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPost: Post = {
    id: 'post1',
    title: 'Test Post',
    content: 'Test Content',
    authorId: mockUser.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockComment: Comment & { author: User; post: Post } = {
    id: 'comment1',
    content: 'Test Comment',
    postId: mockPost.id,
    authorId: mockUser.id,
    createdAt: new Date(),
    updatedAt: new Date(),
    author: mockUser,
    post: mockPost,
  };

  const mockRequest = {
    user: {
      userId: mockUser.id,
      username: mockUser.username,
    },
  } as AuthenticatedRequest;

  const mockCommentsService = {
    create: jest.fn(),
  };

  const mockPostsService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    mockLogger = {
      error: jest.fn(),
    };

    jest.spyOn(Logger.prototype, 'error').mockImplementation(mockLogger.error);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        {
          provide: CommentsService,
          useValue: mockCommentsService,
        },
        {
          provide: PostsService,
          useValue: mockPostsService,
        },
      ],
    }).compile();

    controller = module.get<CommentsController>(CommentsController);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('create', () => {
    it('should create a comment successfully', async () => {
      const createCommentDto: CreateCommentDto = {
        content: 'Test Comment',
        postId: mockPost.id,
      };

      mockPostsService.findOne.mockResolvedValue(mockPost);
      mockCommentsService.create.mockResolvedValue(mockComment);

      const result = await controller.create(mockRequest, createCommentDto);

      expect(result).toEqual(mockComment);
      expect(mockPostsService.findOne).toHaveBeenCalledWith(mockPost.id);
      expect(mockCommentsService.create).toHaveBeenCalledWith(
        createCommentDto,
        mockRequest.user.userId,
      );
    });

    it('should throw NotFoundException when post is not found', async () => {
      const createCommentDto: CreateCommentDto = {
        content: 'Test Comment',
        postId: 'nonexistent-post',
      };

      mockPostsService.findOne.mockResolvedValue(null);

      await expect(
        controller.create(mockRequest, createCommentDto),
      ).rejects.toThrow(NotFoundException);
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle errors during comment creation', async () => {
      const createCommentDto: CreateCommentDto = {
        content: 'Test Comment',
        postId: mockPost.id,
      };

      mockPostsService.findOne.mockResolvedValue(mockPost);
      const error = new Error('Database error');
      mockCommentsService.create.mockRejectedValue(error);

      await expect(
        controller.create(mockRequest, createCommentDto),
      ).rejects.toThrow(error);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error creating comment',
        error,
      );
    });
  });
});
