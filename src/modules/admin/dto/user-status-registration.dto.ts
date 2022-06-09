import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class ChangeUserStatusRegistrationDto {
  @ApiProperty({
    required: true,
    type: Number,
    example: [1, 2],
  })
  @IsArray()
  usersId: number[];

  @ApiProperty({
    required: true,
  })
  status: number;
}
