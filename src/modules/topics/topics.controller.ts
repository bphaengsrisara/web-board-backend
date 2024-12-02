import {
  Controller,
  Get,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { TopicsService } from './topics.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Topic } from '@prisma/client';

@ApiTags('topics')
@Controller('topics')
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}
  private readonly logger = new Logger(TopicsController.name);

  @Get()
  @ApiOperation({ summary: 'Get all topics' })
  @ApiResponse({
    status: 200,
    description: 'Returns all topics',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async findAll(): Promise<Topic[]> {
    try {
      return await this.topicsService.findAll();
    } catch (error) {
      this.logger.error('Failed to fetch topics', error);
      throw new InternalServerErrorException('Failed to fetch topics');
    }
  }
}
