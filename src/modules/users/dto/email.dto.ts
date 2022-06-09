import { ApiProperty } from '@nestjs/swagger';

export class EmailDto {
  @ApiProperty({
    required: true,
  })
  email: string;
}
