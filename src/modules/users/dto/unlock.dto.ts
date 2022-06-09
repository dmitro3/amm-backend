import { ApiProperty } from '@nestjs/swagger';

export class UnlockAccountDto {
  @ApiProperty({
    required: true,
  })
  user_id: number;
}
