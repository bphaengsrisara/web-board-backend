import {
  Controller,
  Post,
  Body,
  Res,
  HttpCode,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { ApiTags, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CreateUserDto } from '../users/dto/create-user.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  private readonly logger = new Logger(AuthController.name);

  @Post('sign-in')
  @HttpCode(200)
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 200,
    description: 'Sign-in successful',
    schema: { example: { message: 'Sign-in successful' } },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request',
    schema: {
      example: {
        statusCode: 400,
        message: ['username should not be empty', 'username must be a string'],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Sign-in failed',
    schema: {
      example: {
        statusCode: 401,
        message: 'Sign-in failed',
        error: 'Unauthorized',
      },
    },
  })
  async signIn(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { username } = createUserDto;
    try {
      const { accessToken } = await this.authService.signIn(username);
      res.cookie('access_token', accessToken, { httpOnly: true });
      return { message: 'Sign-in successful' };
    } catch (error) {
      this.logger.error('Sign-in failed', error);
      throw new UnauthorizedException('Sign-in failed');
    }
  }

  @Post('sign-out')
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: 'Sign-out successful',
    schema: { example: { message: 'Sign-out successful' } },
  })
  @ApiResponse({
    status: 401,
    description: 'Sign-out failed',
    schema: {
      example: {
        statusCode: 401,
        message: 'Sign-out failed',
        error: 'Unauthorized',
      },
    },
  })
  signOut(@Res({ passthrough: true }) res: Response) {
    try {
      res.clearCookie('access_token');
      return this.authService.signOut();
    } catch (error) {
      this.logger.error('Sign-out failed', error);
      throw new UnauthorizedException('Sign-out failed');
    }
  }
}
