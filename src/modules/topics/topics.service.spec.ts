import { Test, TestingModule } from '@nestjs/testing';
import { TopicsService } from './topics.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Topic } from '@prisma/client';

const mockTopics: Topic[] = [
  { id: '1', name: 'Test Topic 1' },
  { id: '2', name: 'Test Topic 2' },
];

describe('TopicsService', () => {
  let service: TopicsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<TopicsService>(TopicsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of topics', async () => {
      const result = await service.findAll();
      expect(result).toEqual(mockTopics);
      expect(prisma.topic.findMany).toHaveBeenCalled();
    });
  });
});
