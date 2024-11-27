import { User } from '@prisma/client';
import { Request } from 'express';

export interface JwtPayload {
  sub: string;
  username: string;
}

export interface AuthenticatedUser {
  userId: string;
  username: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
