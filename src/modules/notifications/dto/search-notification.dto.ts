import { ApiProperty } from '@nestjs/swagger';

export class SearchNotificationDto {
  user_id: number;
  is_read: string;
  is_trash: string;

  @ApiProperty({
    required: true,
  })
  page: number;
  @ApiProperty({
    required: true,
  })
  size: number;
}
