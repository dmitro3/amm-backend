import { ApiProperty } from '@nestjs/swagger';

export class ChangeUserTypeDto {
  @ApiProperty({
    required: true,
    example: [1, 2],
  })
  usersId: number[];

  @ApiProperty({
    required: true,
  })
  user_type: number;

  @ApiProperty({
    required: true,
  })
  adminEmail: string;
}
