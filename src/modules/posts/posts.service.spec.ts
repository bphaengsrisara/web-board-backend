import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Comment, Post, Topic, User } from '@prisma/client';
import { PostWithChildren } from 'src/interfaces';

describe('PostsService', () => {
  let service: PostsService;

  const mockUser: User = {
    id: 'user1',
    username: 'testuser',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTopic: Topic = {
    id: 'topic1',
    name: 'Test Topic',
  };

  const mockComment: Comment = {
    id: 'comment1',
    content: 'Test Comment',
    postId: 'post1',
    authorId: mockUser.id,
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

  const mockPostWithRelations = {
    ...mockPost,
    author: mockUser,
    topics: [mockTopic],
    comments: [
      {
        ...mockComment,
        author: mockUser,
      },
    ],
  } satisfies PostWithChildren;

  const mockPrismaService = {
    post: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    topic: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a post with valid topics', async () => {
      const createPostDto: CreatePostDto = {
        title: 'Test Post',
        content: 'Test Content',
        topicIds: [mockTopic.id],
      };

      mockPrismaService.topic.findMany.mockResolvedValue([mockTopic]);
      mockPrismaService.post.create.mockResolvedValue(mockPost);
      mockPrismaService.post.findUnique.mockResolvedValue(
        mockPostWithRelations,
      );

      const result = await service.create(createPostDto, mockUser.id);

      expect(result).not.toBeNull();
      if (result) {
        expect(result.title).toBe(createPostDto.title);
        expect(result.topics).toHaveLength(1);
        expect(result.comments[0].author).toEqual(mockUser);
      }
    });
  });

  describe('update', () => {
    it('should update a post with valid topics', async () => {
      const updatePostDto: UpdatePostDto = {
        title: 'Updated Title',
        content: 'Updated Content',
        topicIds: [mockTopic.id],
      };

      mockPrismaService.topic.findMany.mockResolvedValue([mockTopic]);
      mockPrismaService.post.update.mockResolvedValue({
        ...mockPost,
        title: updatePostDto.title,
        content: updatePostDto.content,
      });
      mockPrismaService.post.findUnique.mockResolvedValue({
        ...mockPost,
        title: updatePostDto.title,
        content: updatePostDto.content,
        author: mockUser,
        topics: [{ topic: mockTopic }],
        comments: [],
      });

      const result = await service.update(mockPost.id, updatePostDto);

      expect(result).not.toBeNull();
      if (result) {
        expect(result.title).toBe(updatePostDto.title);
        expect(result.content).toBe(updatePostDto.content);
        expect(result.topics).toHaveLength(1);
        expect(result.topics[0].id).toEqual(mockTopic.id);
      }
    });
  });

  describe('findAll', () => {
    it('should return all posts for a user', async () => {
      mockPrismaService.post.findMany.mockResolvedValue([
        mockPostWithRelations,
      ]);

      const result = await service.findAll(mockUser.id);

      expect(result).toHaveLength(1);
      expect(result[0].author).toEqual(mockUser);
      expect(result[0].topics).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return a single post with its relations', async () => {
      mockPrismaService.post.findUnique.mockResolvedValue(
        mockPostWithRelations,
      );

      const result = await service.findOne(mockPost.id);

      expect(result).not.toBeNull();
      if (result) {
        expect(result.author).toEqual(mockUser);
        expect(result.topics).toHaveLength(1);
      }
    });
  });

  describe('remove', () => {
    it('should delete a post', async () => {
      mockPrismaService.post.delete.mockResolvedValue(mockPost);

      const result = await service.remove(mockPost.id);

      expect(result).toEqual(mockPost);
      expect(mockPrismaService.post.delete).toHaveBeenCalledWith({
        where: { id: mockPost.id },
      });
    });
  });
});