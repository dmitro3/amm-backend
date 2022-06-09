import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    required: false,
  })
  userId: number;
  @ApiProperty({
    required: false,
  })
  functional_currencies: number[];
}
