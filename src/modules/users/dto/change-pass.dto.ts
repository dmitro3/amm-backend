import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ChangePassDto {
  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  newPassword: string;
}
