import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AuthenticatedRequest } from 'src/interfaces';

jest.mock('../auth/jwt-auth.guard', () => ({
  JwtAuthGuard: jest.fn().mockImplementation(() => ({
    canActivate: jest.fn().mockReturnValue(true),
  })),
}));

describe('PostsController', () => {
  let controller: PostsController;
  let service: PostsService;

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
    acceptsCharsets: jest.fn(),
    acceptsEncodings: jest.fn(),
    acceptsLanguages: jest.fn(),
    param: jest.fn(),
    is: jest.fn(),
  } as unknown as AuthenticatedRequest;

  beforeEach(async () => {
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
    service = module.get<PostsService>(PostsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new post', async () => {
      const createPostDto: CreatePostDto = {
        title: 'Test Post',
        content: 'Test Content',
        topicIds: [],
      };

      mockPostsService.create.mockResolvedValue(mockPost);

      const result = await controller.create(mockRequest, createPostDto);

      expect(service.create).toHaveBeenCalledWith(createPostDto, 'user1');
      expect(result).toEqual(mockPost);
    });
  });

  describe('findAll', () => {
    it('should return an array of posts', async () => {
      mockPostsService.findAll.mockResolvedValue([mockPost]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockPost]);
    });
  });

  describe('findAllMyPosts', () => {
    it('should return posts for authenticated user', async () => {
      mockPostsService.findAll.mockResolvedValue([mockPost]);

      const result = await controller.findAllMyPosts(mockRequest);

      expect(service.findAll).toHaveBeenCalledWith('user1');
      expect(result).toEqual([mockPost]);
    });
  });

  describe('findOne', () => {
    it('should return a single post', async () => {
      mockPostsService.findOne.mockResolvedValue(mockPost);

      const result = await controller.findOne('1');

      expect(service.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockPost);
    });

    it('should throw NotFoundException when post not found', async () => {
      mockPostsService.findOne.mockResolvedValue(null);

      await expect(controller.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updatePostDto: UpdatePostDto = {
      title: 'Updated Title',
      content: 'Updated Content',
    };

    it('should update a post if user owns it', async () => {
      mockPostsService.findOne.mockResolvedValue(mockPost);
      mockPostsService.update.mockResolvedValue({
        ...mockPost,
        ...updatePostDto,
      });

      const result = await controller.update(mockRequest, updatePostDto, '1');

      expect(service.update).toHaveBeenCalledWith('1', updatePostDto);
      expect(result).toEqual({ ...mockPost, ...updatePostDto });
    });

    it('should throw NotFoundException when post not found', async () => {
      mockPostsService.findOne.mockResolvedValue(null);

      await expect(
        controller.update(mockRequest, updatePostDto, '1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user does not own the post', async () => {
      mockPostsService.findOne.mockResolvedValue({
        ...mockPost,
        authorId: 'other-user',
      });

      await expect(
        controller.update(mockRequest, updatePostDto, '1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should remove a post if user owns it', async () => {
      mockPostsService.findOne.mockResolvedValue(mockPost);
      mockPostsService.remove.mockResolvedValue(mockPost);

      const result = await controller.remove(mockRequest, '1');

      expect(service.remove).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockPost);
    });

    it('should throw NotFoundException when post not found', async () => {
      mockPostsService.findOne.mockResolvedValue(null);

      await expect(controller.remove(mockRequest, '1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user does not own the post', async () => {
      mockPostsService.findOne.mockResolvedValue({
        ...mockPost,
        authorId: 'other-user',
      });

      await expect(controller.remove(mockRequest, '1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('checkExists', () => {
    it('should return post if it exists', async () => {
      mockPostsService.findOne.mockResolvedValue(mockPost);

      const result = await controller.checkExists('1');
      expect(result).toEqual(mockPost);
    });

    it('should throw NotFoundException if post does not exist', async () => {
      mockPostsService.findOne.mockResolvedValue(null);

      await expect(controller.checkExists('1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('checkOwnership', () => {
    it('should not throw error if user owns the post', async () => {
      await expect(
        controller.checkOwnership(mockRequest, mockPost),
      ).resolves.not.toThrow();
    });

    it('should throw ForbiddenException if user does not own the post', async () => {
      const otherPost = { ...mockPost, authorId: 'other-user' };

      await expect(
        controller.checkOwnership(mockRequest, otherPost),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
