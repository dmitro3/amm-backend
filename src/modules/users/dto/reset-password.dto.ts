import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @IsNotEmpty()
  @ApiProperty({
    required: true,
  })
  email: string;

  @IsNotEmpty()
  @ApiProperty({
    required: true,
  })
  token: string;

  @IsNotEmpty()
  @ApiProperty({
    required: true,
  })
  password: string;
}
