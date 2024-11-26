import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Response } from 'express';

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
  let authService: AuthService;

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
    authService = module.get<AuthService>(AuthService);
  });

  it('controller should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('authService should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('signIn', () => {
    it('should set a cookie and return a success message', async () => {
      const res = {
        cookie: jest.fn(),
      } as unknown as Response;
      const result = await controller.signIn('testuser', res);
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
