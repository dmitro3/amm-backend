import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class SearchTradeDto {
  @ApiPropertyOptional({ type: Number, required: false })
  @IsOptional()
  pair: string;

  @ApiPropertyOptional({ type: String, required: false })
  @IsOptional()
  wallet: string;

  @ApiPropertyOptional({ type: Array, required: true })
  @IsOptional()
  tradeMethodTab: number[];

  @ApiPropertyOptional({ type: Number, required: true })
  @IsOptional()
  userId: number;

  @ApiPropertyOptional({ type: String, required: false })
  @IsOptional()
  orderId: string;

  @ApiPropertyOptional({ type: String, required: false })
  @IsOptional()
  pool: string;

  @ApiPropertyOptional({ type: Number, required: false })
  @IsOptional()
  type: number;

  @ApiPropertyOptional({ type: Number, required: false })
  @IsOptional()
  coinId: number;

  @ApiPropertyOptional({ type: Date, required: false })
  @IsOptional()
  startDate: Date;

  @ApiPropertyOptional({ type: Date, required: false })
  @IsOptional()
  endDate: Date;
}
