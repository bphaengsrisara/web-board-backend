import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { UnauthorizedException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateUserDto } from '../users/dto/create-user.dto';

jest.mock('./auth.service');

const mockAuthService = {
  signIn: jest.fn().mockResolvedValue({
    accessToken: 'test-token',
    user: { id: 'user123', username: 'testuser' },
  }),
  signOut: jest.fn().mockReturnValue({ message: 'Sign-out successful' }),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signIn', () => {
    it('should set a cookie and return a success message', async () => {
      const res = {
        cookie: jest.fn(),
      } as unknown as Response;
      const result = await controller.signIn({ username: 'testuser' }, res);
      expect(res.cookie).toHaveBeenCalledWith('access_token', 'test-token', {
        httpOnly: true,
      });
      expect(result).toEqual({ message: 'Sign-in successful' });
    });

    it('should throw BadRequestException if username is empty', async () => {
      const createUserDto = plainToInstance(CreateUserDto, { username: '' });
      const errors = await validate(createUserDto);
      expect(errors.length).not.toBe(0);
      expect(JSON.stringify(errors)).toContain('username should not be empty');
    });

    it('should throw BadRequestException if username is missing', async () => {
      const createUserDto = plainToInstance(CreateUserDto, {});
      const errors = await validate(createUserDto);
      expect(errors.length).not.toBe(0);
      expect(JSON.stringify(errors)).toContain('username should not be empty');
      expect(JSON.stringify(errors)).toContain('username must be a string');
    });

    it('should throw UnauthorizedException if signIn fails', async () => {
      mockAuthService.signIn.mockRejectedValueOnce(new Error('Sign-in failed'));
      const res = {
        cookie: jest.fn(),
      } as unknown as Response;
      await expect(
        controller.signIn({ username: 'testuser' }, res),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('signOut', () => {
    it('should clear the cookie and return a success message', () => {
      const res = {
        clearCookie: jest.fn(),
      } as unknown as Response;
      const result = controller.signOut(res);
      expect(res.clearCookie).toHaveBeenCalledWith('access_token');
      expect(result).toEqual({ message: 'Sign-out successful' });
    });
  });
});
