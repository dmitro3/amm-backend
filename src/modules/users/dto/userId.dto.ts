import { ApiProperty } from '@nestjs/swagger';

export class userIdDto {
  @ApiProperty({
    required: true,
  })
  userId: number;
}
