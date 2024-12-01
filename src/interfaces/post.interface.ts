import { Comment, Post, Topic, User } from '@prisma/client';

export interface CommentWithAuthor extends Comment {
  author: User;
}

export interface PostWithChildren extends Post {
  author: User;
  topics: Topic[];
  comments: CommentWithAuthor[];
}
