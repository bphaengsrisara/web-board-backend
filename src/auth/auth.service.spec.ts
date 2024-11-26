import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

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
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signIn', () => {
    it('should return an access token', () => {
      const result = service.signIn('user123');
      expect(result).toEqual({ accessToken: 'test-token' });
      expect(jwtService.sign).toHaveBeenCalledWith({ username: 'user123' });
    });
  });

  describe('signOut', () => {
    it('should return a sign-out message', () => {
      const result = service.signOut();
      expect(result).toEqual({ message: 'Sign-out successful' });
    });
  });
});
