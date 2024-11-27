import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Post } from '@prisma/client';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async create(createPostDto: CreatePostDto, userId: string): Promise<Post> {
    const { title, content } = createPostDto;

    return this.prisma.post.create({
      data: {
        title,
        content,
        authorId: userId,
      },
    });
  }

  async findAll(authorId?: string): Promise<Post[]> {
    return this.prisma.post.findMany({
      where: { authorId },
    });
  }

  async findOne(id: string): Promise<Post | null> {
    return this.prisma.post.findUnique({
      where: { id },
    });
  }

  async update(id: string, updatePostDto: UpdatePostDto): Promise<Post> {
    const { title, content } = updatePostDto;
    return this.prisma.post.update({
      where: { id },
      data: {
        title,
        content,
      },
    });
  }

  async remove(id: string): Promise<Post> {
    return this.prisma.post.delete({
      where: { id },
    });
  }
}
