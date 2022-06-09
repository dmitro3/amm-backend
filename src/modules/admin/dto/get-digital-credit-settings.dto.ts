import { ApiProperty } from '@nestjs/swagger';

export class DigitalCreditFilterDto {
  @ApiProperty({
    required: false,
  })
  digital_credit: string;

  @ApiProperty({
    required: false,
  })
  status: number;
}
