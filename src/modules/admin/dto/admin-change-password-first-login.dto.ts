import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdminChangePasswordFirstLogin {
  @ApiProperty({
    required: true,
    description: 'email',
  })
  @IsNotEmpty()
  @IsEmail()
  readonly username: string;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  readonly password: string;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  readonly newPassword: string;
}
