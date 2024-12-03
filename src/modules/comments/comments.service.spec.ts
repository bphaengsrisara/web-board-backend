import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Comment, Post, User } from '@prisma/client';
import { CreateCommentDto } from './dto/create-comment.dto';

type MockPrismaService = {
  comment: {
    create: jest.Mock;
    update: jest.Mock;
    findUnique: jest.Mock;
    delete: jest.Mock;
  };
  post: {
    update: jest.Mock;
  };
  $transaction: jest.Mock;
};

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

  const mockPrismaService: MockPrismaService = {
    comment: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    post: {
      update: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
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

      mockPrismaService.post.update.mockResolvedValue(mockPost);

      const result = await service.create(createCommentDto, mockUser.id);

      expect(result).not.toBeNull();
      if (result) {
        expect(result.content).toBe(createCommentDto.content);
        expect(result.author).toEqual(mockUser);
        expect(result.post).toEqual(mockPost);
      }

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
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

      expect(mockPrismaService.post.update).toHaveBeenCalledWith({
        where: { id: createCommentDto.postId },
        data: { updatedAt: expect.any(Date) },
      });
    });
  });

  describe('findOne', () => {
    it('should return a comment with its relations', async () => {
      const commentWithRelations = {
        ...mockComment,
        author: mockUser,
        post: mockPost,
      };

      mockPrismaService.comment.findUnique.mockResolvedValue(
        commentWithRelations,
      );

      const result = await service.findOne(mockComment.id);

      expect(result).toEqual(commentWithRelations);
      expect(mockPrismaService.comment.findUnique).toHaveBeenCalledWith({
        where: { id: mockComment.id },
        include: {
          author: true,
          post: true,
        },
      });
    });
  });

  describe('update', () => {
    it('should update a comment and trigger post update', async () => {
      const updateCommentDto = {
        content: 'Updated Comment',
      };

      const updatedComment = {
        ...mockComment,
        content: updateCommentDto.content,
        author: mockUser,
        post: mockPost,
      };

      mockPrismaService.comment.update.mockResolvedValue(updatedComment);
      mockPrismaService.post.update.mockResolvedValue(mockPost);

      const result = await service.update(mockComment.id, updateCommentDto);

      expect(result).toEqual(updatedComment);
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(mockPrismaService.comment.update).toHaveBeenCalledWith({
        where: { id: mockComment.id },
        data: {
          content: updateCommentDto.content,
        },
        include: {
          author: true,
          post: true,
        },
      });
      expect(mockPrismaService.post.update).toHaveBeenCalledWith({
        where: { id: mockPost.id },
        data: { updatedAt: expect.any(Date) },
      });
    });
  });

  describe('remove', () => {
    it('should delete a comment and trigger post update', async () => {
      mockPrismaService.comment.findUnique.mockResolvedValue(mockComment);
      mockPrismaService.comment.delete.mockResolvedValue(mockComment);
      mockPrismaService.post.update.mockResolvedValue(mockPost);

      const result = await service.remove(mockComment.id);

      expect(result).toEqual(mockComment);
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(mockPrismaService.comment.findUnique).toHaveBeenCalledWith({
        where: { id: mockComment.id },
        select: { postId: true },
      });
      expect(mockPrismaService.comment.delete).toHaveBeenCalledWith({
        where: { id: mockComment.id },
      });
      expect(mockPrismaService.post.update).toHaveBeenCalledWith({
        where: { id: mockPost.id },
        data: { updatedAt: expect.any(Date) },
      });
    });
  });
});
