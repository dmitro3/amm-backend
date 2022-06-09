import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class SearchBalancesInOrderDto {
  @ApiPropertyOptional({ type: [String], required: false })
  @IsOptional()
  @IsNotEmpty()
  wallet: string[];
}
