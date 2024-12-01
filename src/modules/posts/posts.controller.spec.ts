import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ForbiddenException, Logger, NotFoundException } from '@nestjs/common';
import { AuthenticatedRequest } from 'src/interfaces';

jest.mock('../auth/jwt-auth.guard', () => ({
  JwtAuthGuard: jest.fn().mockImplementation(() => ({
    canActivate: jest.fn().mockReturnValue(true),
  })),
}));

describe('PostsController', () => {
  let controller: PostsController;
  let mockLogger: { error: jest.Mock };

  const mockPost = {
    id: '1',
    title: 'Test Post',
    content: 'Test Content',
    authorId: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
    topics: [],
    comments: [],
    author: {
      id: 'user1',
      username: 'testuser',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  const mockPostsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockRequest = {
    user: {
      userId: 'user1',
      email: 'test@example.com',
    },
    get: jest.fn(),
    header: jest.fn(),
    accepts: jest.fn(),
  } as unknown as AuthenticatedRequest;

  beforeEach(async () => {
    // Manually create a mock logger with a spy
    mockLogger = {
      error: jest.fn(),
    };

    jest.spyOn(Logger.prototype, 'error').mockImplementation(mockLogger.error);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        {
          provide: PostsService,
          useValue: mockPostsService,
        },
      ],
    }).compile();

    controller = module.get<PostsController>(PostsController);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('create', () => {
    const createPostDto: CreatePostDto = {
      title: 'Test Post',
      content: 'Test Content',
      topicIds: [],
    };

    it('should create a post successfully', async () => {
      mockPostsService.create.mockResolvedValue(mockPost);
      const result = await controller.create(mockRequest, createPostDto);
      expect(result).toEqual(mockPost);
      expect(mockPostsService.create).toHaveBeenCalledWith(
        createPostDto,
        mockRequest.user.userId,
      );
    });

    it('should handle errors during post creation', async () => {
      const error = new Error('Database error');
      mockPostsService.create.mockRejectedValue(error);

      await expect(
        controller.create(mockRequest, createPostDto),
      ).rejects.toThrow(error);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error creating post',
        error,
      );
    });
  });

  describe('findAll', () => {
    it('should return all posts', async () => {
      const posts = [mockPost];
      mockPostsService.findAll.mockResolvedValue(posts);

      const result = await controller.findAll();
      expect(result).toEqual(posts);
    });

    it('should handle errors when finding all posts', async () => {
      const error = new Error('Database error');
      mockPostsService.findAll.mockRejectedValue(error);

      await expect(controller.findAll()).rejects.toThrow(error);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error finding all posts',
        error,
      );
    });
  });

  describe('findOne', () => {
    it('should return a post by id', async () => {
      mockPostsService.findOne.mockResolvedValue(mockPost);

      const result = await controller.findOne('1');
      expect(result).toEqual(mockPost);
    });

    it('should throw NotFoundException when post not found', async () => {
      mockPostsService.findOne.mockResolvedValue(null);

      await expect(controller.findOne('1')).rejects.toThrow(NotFoundException);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error checking post existence with id 1',
        expect.any(NotFoundException),
      );
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      mockPostsService.findOne.mockRejectedValue(error);

      await expect(controller.findOne('1')).rejects.toThrow(error);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error checking post existence with id 1',
        error,
      );
    });
  });

  describe('update', () => {
    const updatePostDto: UpdatePostDto = {
      title: 'Updated Post',
    };

    it('should update a post if user owns it', async () => {
      mockPostsService.findOne.mockResolvedValue(mockPost);
      mockPostsService.update.mockResolvedValue({
        ...mockPost,
        ...updatePostDto,
      });

      const result = await controller.update(mockRequest, updatePostDto, '1');
      expect(result).toEqual({ ...mockPost, ...updatePostDto });
    });

    it('should throw ForbiddenException if user does not own the post', async () => {
      const differentUserPost = { ...mockPost, authorId: 'user2' };
      mockPostsService.findOne.mockResolvedValue(differentUserPost);

      await expect(
        controller.update(mockRequest, updatePostDto, '1'),
      ).rejects.toThrow(ForbiddenException);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error checking post ownership',
        expect.any(ForbiddenException),
      );
    });

    it('should handle database errors during update', async () => {
      const error = new Error('Database error');
      mockPostsService.findOne.mockResolvedValue(mockPost);
      mockPostsService.update.mockRejectedValue(error);

      await expect(
        controller.update(mockRequest, updatePostDto, '1'),
      ).rejects.toThrow(error);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error updating post with id 1',
        error,
      );
    });
  });

  describe('remove', () => {
    it('should remove a post if user owns it', async () => {
      mockPostsService.findOne.mockResolvedValue(mockPost);
      mockPostsService.remove.mockResolvedValue(mockPost);

      const result = await controller.remove(mockRequest, '1');
      expect(result).toEqual(mockPost);
    });

    it('should throw ForbiddenException if user does not own the post', async () => {
      const differentUserPost = { ...mockPost, authorId: 'user2' };
      mockPostsService.findOne.mockResolvedValue(differentUserPost);

      await expect(controller.remove(mockRequest, '1')).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error checking post ownership',
        expect.any(ForbiddenException),
      );
    });

    it('should handle database errors during removal', async () => {
      const error = new Error('Database error');
      mockPostsService.findOne.mockResolvedValue(mockPost);
      mockPostsService.remove.mockRejectedValue(error);

      await expect(controller.remove(mockRequest, '1')).rejects.toThrow(error);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error deleting post with id 1',
        error,
      );
    });
  });
});
