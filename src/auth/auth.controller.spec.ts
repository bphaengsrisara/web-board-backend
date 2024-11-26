import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signIn: jest.fn().mockReturnValue({ accessToken: 'test-token' }),
            signOut: jest
              .fn()
              .mockReturnValue({ message: 'Sign-out successful' }),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signIn', () => {
    it('should set a cookie and return a success message', () => {
      const res = {
        cookie: jest.fn(),
      } as unknown as Response;
      const result = controller.signIn('user123', res);
      expect(res.cookie).toHaveBeenCalledWith('jwt', 'test-token', {
        httpOnly: true,
      });
      expect(result).toEqual({ message: 'Sign-in successful' });
    });
  });

  describe('signOut', () => {
    it('should clear the cookie and return a success message', () => {
      const res = {
        clearCookie: jest.fn(),
      } as unknown as Response;
      const result = controller.signOut(res);
      expect(res.clearCookie).toHaveBeenCalledWith('jwt');
      expect(result).toEqual({ message: 'Sign-out successful' });
    });
  });
});
