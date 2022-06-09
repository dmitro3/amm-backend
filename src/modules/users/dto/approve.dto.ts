import { ApiProperty } from '@nestjs/swagger';

export class ApproveDto {
  @ApiProperty({
    required: true,
  })
  user_id: number;
}
