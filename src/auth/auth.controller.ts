import {
  Controller,
  Post,
  Body,
  Res,
  HttpCode,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { ApiTags, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  private readonly logger = new Logger(AuthController.name);

  @Post('sign-in')
  @HttpCode(200)
  @ApiBody({ schema: { example: { username: 'user123' } } })
  @ApiResponse({
    status: 200,
    description: 'Sign-in successful',
    schema: { example: { message: 'Sign-in successful' } },
  })
  @ApiResponse({
    status: 400,
    description: 'Username is required',
    schema: {
      example: {
        statusCode: 400,
        message: 'Username is required',
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
    @Body('username') username: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!username) {
      throw new BadRequestException('Username is required');
    }
    try {
      const { accessToken } = await this.authService.signIn(username);
      res.cookie('jwt', accessToken, { httpOnly: true });
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
      res.clearCookie('jwt');
      return this.authService.signOut();
    } catch (error) {
      this.logger.error('Sign-out failed', error);
      throw new UnauthorizedException('Sign-out failed');
    }
  }
}
