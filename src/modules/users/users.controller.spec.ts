import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { AuthenticatedRequest } from '../../interfaces/auth.interface';

const mockUser: User = {
  id: 'user123',
  username: 'testuser',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUsersService = {
  findOneById: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    const mockRequest = {
      user: {
        userId: 'user123',
        username: 'testuser',
      },
    } as AuthenticatedRequest;

    it('should return user profile when user exists', async () => {
      jest
        .spyOn(mockUsersService, 'findOneById')
        .mockResolvedValueOnce(mockUser);

      const result = await controller.getProfile(mockRequest);

      expect(result).toEqual(mockUser);
      expect(mockUsersService.findOneById).toHaveBeenCalledWith('user123');
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(mockUsersService, 'findOneById').mockResolvedValueOnce(null);

      await expect(controller.getProfile(mockRequest)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should propagate errors from service', async () => {
      const error = new Error('Database error');
      jest.spyOn(mockUsersService, 'findOneById').mockRejectedValueOnce(error);

      await expect(controller.getProfile(mockRequest)).rejects.toThrow(error);
    });
  });
});
