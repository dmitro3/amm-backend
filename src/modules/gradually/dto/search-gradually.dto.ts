import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class SearchGraduallyDto {
  pool_address: string;
  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  page: number;
  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  size: number;
}
