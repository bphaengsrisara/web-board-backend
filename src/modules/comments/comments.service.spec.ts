import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Comment, Post, User } from '@prisma/client';
import { CreateCommentDto } from './dto/create-comment.dto';

describe('CommentsService', () => {
  let service: CommentsService;

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

  const mockComment: Comment = {
    id: 'comment1',
    content: 'Test Comment',
    postId: mockPost.id,
    authorId: mockUser.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    comment: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a comment with author and post details', async () => {
      const createCommentDto: CreateCommentDto = {
        content: 'Test Comment',
        postId: mockPost.id,
      };

      mockPrismaService.comment.create.mockResolvedValue({
        ...mockComment,
        author: mockUser,
        post: mockPost,
      });

      const result = await service.create(createCommentDto, mockUser.id);

      expect(result).not.toBeNull();
      if (result) {
        expect(result.content).toBe(createCommentDto.content);
        expect(result.author).toEqual(mockUser);
        expect(result.post).toEqual(mockPost);
      }

      expect(mockPrismaService.comment.create).toHaveBeenCalledWith({
        data: {
          content: createCommentDto.content,
          postId: createCommentDto.postId,
          authorId: mockUser.id,
        },
        include: {
          author: true,
          post: true,
        },
      });
    });
  });
});
