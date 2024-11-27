import { IsString, IsArray, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ example: 'My First Post' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'This is the content of my first post.' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ example: ['id1', 'id2'] })
  @IsArray()
  @IsString({ each: true })
  topicIds: string[];
}
