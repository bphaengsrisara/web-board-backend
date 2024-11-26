import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  signIn(username: string): { accessToken: string } {
    const payload = { username };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }

  signOut(): { message: string } {
    return { message: 'Sign-out successful' };
  }
}
