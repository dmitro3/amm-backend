import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
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
  readonly isVerify: string;
}
