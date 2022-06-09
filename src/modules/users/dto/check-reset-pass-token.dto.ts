import { ApiProperty } from '@nestjs/swagger';

export class CheckResetPassTokenDto {
  @ApiProperty({
    required: true,
  })
  email: string;

  @ApiProperty({
    required: true,
  })
  token: string;
}
