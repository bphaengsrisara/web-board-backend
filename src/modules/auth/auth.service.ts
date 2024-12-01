import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { AuthResponse } from 'src/interfaces';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async signIn(username: string): Promise<AuthResponse> {
    let user = await this.usersService.findOneByUsername(username);
    if (!user) {
      user = await this.usersService.create({ username });
    }
    const accessToken = this.jwtService.sign({
      sub: user.id,
      username: user.username,
    });
    return { accessToken, user };
  }

  signOut(): { message: string } {
    return { message: 'Sign-out successful' };
  }
}
