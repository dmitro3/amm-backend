import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({
    required: true,
    description: 'verify_email_token',
  })
  @IsNotEmpty()
  readonly verify_email_token: string;
}
