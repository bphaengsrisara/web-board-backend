import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { AuthResponse } from '../interfaces/auth.interface';
import { User } from '@prisma/client';

const mockUser: User = {
  id: 'user123',
  username: 'testuser',
};

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('test-token'),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findOneByUsername: jest.fn().mockResolvedValue(mockUser),
            create: jest.fn().mockResolvedValue(mockUser),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signIn', () => {
    it('should return an access token and user', async () => {
      const result: AuthResponse = await service.signIn('testuser');
      expect(result).toEqual({ accessToken: 'test-token', user: mockUser });
      expect(usersService.findOneByUsername).toHaveBeenCalledWith('testuser');
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        username: mockUser.username,
      });
    });
  });

  describe('signOut', () => {
    it('should return a sign-out message', () => {
      const result = service.signOut();
      expect(result).toEqual({ message: 'Sign-out successful' });
    });
  });
});
