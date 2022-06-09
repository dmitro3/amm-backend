import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateGraduallyDto {
  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  pool_address: string;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  start_block: number;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  end_block: number;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  old_weights: string;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  new_weights: string;
}
