import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { Comment } from '@prisma/client';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(createCommentDto: CreateCommentDto, authorId: string) {
    return this.prisma.$transaction(async (tx) => {
      const comment = await tx.comment.create({
        data: {
          content: createCommentDto.content,
          postId: createCommentDto.postId,
          authorId,
        },
        include: {
          author: true,
          post: true,
        },
      });

      await tx.post.update({
        where: { id: createCommentDto.postId },
        data: { updatedAt: new Date() },
      });

      return comment;
    });
  }

  async findOne(id: string): Promise<Comment | null> {
    return this.prisma.comment.findUnique({
      where: { id },
      include: {
        author: true,
        post: true,
      },
    });
  }

  async update(id: string, updateCommentDto: UpdateCommentDto) {
    return this.prisma.$transaction(async (tx) => {
      const comment = await tx.comment.update({
        where: { id },
        data: {
          content: updateCommentDto.content,
        },
        include: {
          author: true,
          post: true,
        },
      });

      if (comment) {
        // Update the post's updatedAt timestamp
        await tx.post.update({
          where: { id: comment.postId },
          data: { updatedAt: new Date() },
        });
      }

      return comment;
    });
  }

  async remove(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const comment = await tx.comment.findUnique({
        where: { id },
        select: { postId: true },
      });

      if (comment) {
        await tx.comment.delete({
          where: { id },
        });

        // Update the post's updatedAt timestamp
        await tx.post.update({
          where: { id: comment.postId },
          data: { updatedAt: new Date() },
        });
      }

      return comment;
    });
  }
}
