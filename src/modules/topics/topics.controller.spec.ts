import { Test, TestingModule } from '@nestjs/testing';
import { TopicsController } from './topics.controller';
import { TopicsService } from './topics.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Topic } from '@prisma/client';
import { InternalServerErrorException, Logger } from '@nestjs/common';

const mockTopics: Topic[] = [
  { id: '1', name: 'Test Topic 1' },
  { id: '2', name: 'Test Topic 2' },
];

describe('TopicsController', () => {
  let controller: TopicsController;
  let service: TopicsService;
  let mockLogger: { error: jest.Mock };

  beforeEach(async () => {
    mockLogger = {
      error: jest.fn(),
    };

    jest.spyOn(Logger.prototype, 'error').mockImplementation(mockLogger.error);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TopicsController],
      providers: [
        TopicsService,
        {
          provide: PrismaService,
          useValue: {
            topic: {
              findMany: jest.fn().mockResolvedValue(mockTopics),
            },
          },
        },
      ],
    }).compile();

    controller = module.get<TopicsController>(TopicsController);
    service = module.get<TopicsService>(TopicsService);

    // Clear mock calls between tests
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of topics', async () => {
      const result = await controller.findAll();
      expect(result).toEqual(mockTopics);
    });

    it('should handle errors and log them', async () => {
      const error = new Error('Database error');
      jest.spyOn(service, 'findAll').mockRejectedValue(error);

      await expect(controller.findAll()).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to fetch topics',
        error,
      );
    });
  });
});
