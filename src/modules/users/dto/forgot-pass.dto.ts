import { ApiProperty } from '@nestjs/swagger';

export class ForgotPassForm {
  @ApiProperty({
    required: true,
  })
  email: string;
}
