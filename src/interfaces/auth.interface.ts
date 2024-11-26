export interface JwtPayload {
  sub: string;
  username: string;
}

export interface AuthenticatedUser {
  userId: string;
  username: string;
}
