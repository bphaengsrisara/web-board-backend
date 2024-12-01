import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { Post, Prisma } from '@prisma/client';
import { PostWithChildren } from 'src/interfaces';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createPostDto: CreatePostDto,
    userId: string,
  ): Promise<PostWithChildren | null> {
    const { title, content, topicIds } = createPostDto;

    const validTopics = topicIds
      ? await this.prisma.topic.findMany({
          where: { id: { in: topicIds } },
        })
      : [];

    const createdPost = await this.prisma.post.create({
      data: {
        title,
        content,
        authorId: userId,
        topics: {
          create: validTopics.map((topic) => ({
            topic: {
              connect: { id: topic.id },
            },
          })),
        },
      },
    });

    return this.findOne(createdPost.id);
  }

  async findAll(authorId?: string): Promise<PostWithChildren[]> {
    const posts = await this.prisma.post.findMany({
      where: { authorId },
      include: postInclude,
    });

    return posts.map((post) => ({
      ...post,
      topics: post.topics.map((t) => t.topic),
    }));
  }

  async findOne(id: string): Promise<PostWithChildren | null> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: postInclude,
    });

    if (!post) return null;

    return {
      ...post,
      topics: post.topics.map((t) => t.topic),
    };
  }

  async update(
    id: string,
    updatePostDto: UpdatePostDto,
  ): Promise<PostWithChildren | null> {
    const { title, content, topicIds } = updatePostDto;

    const validTopics = topicIds
      ? await this.prisma.topic.findMany({
          where: { id: { in: topicIds } },
        })
      : [];

    await this.prisma.post.update({
      where: { id },
      data: {
        title,
        content,
        topics:
          // if no topicIds were provided that mean user dont want to update topics
          topicIds
            ? {
                // delete all existing topics
                deleteMany: {},
                // then re-create new topics
                create: validTopics?.map((topic) => ({
                  topic: {
                    connect: { id: topic.id },
                  },
                })),
              }
            : {},
      },
    });

    return this.findOne(id);
  }

  async remove(id: string): Promise<Post> {
    return this.prisma.post.delete({
      where: { id },
    });
  }
}

const postInclude = {
  author: true,
  topics: {
    select: {
      topic: true,
    },
  },
  comments: true,
} satisfies Prisma.PostInclude;
