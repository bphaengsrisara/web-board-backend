import { User } from '@prisma/client';

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
