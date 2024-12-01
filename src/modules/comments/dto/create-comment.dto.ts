import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    example: 'clk8sf3g30000jrp8zp3i5q1n',
    description: 'The ID of the post being commented on',
  })
  @IsString()
  @IsNotEmpty()
  postId: string;

  @ApiProperty({
    example: 'This is a great post!',
    description: 'The content of the comment',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
