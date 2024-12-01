import { Comment, Post, Topic, User } from '@prisma/client';

export interface PostWithChildren extends Post {
  author: User;
  topics: Topic[];
  comments: Comment[];
}
