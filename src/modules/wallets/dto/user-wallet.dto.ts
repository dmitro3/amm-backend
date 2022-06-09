import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Matches } from 'class-validator';

export class CreateUserWalletDto {
  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9]*$/, { each: true })
  address: string;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  status: number;
}
