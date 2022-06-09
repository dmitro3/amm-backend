import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class SearchUserWalletByAdminDto {
  // optional user approved/reject by admin
  @ApiPropertyOptional({ type: Number, required: false })
  @IsOptional()
  user_type: string;

  @ApiPropertyOptional({ type: String, required: false })
  @IsOptional()
  status: string;

  @ApiPropertyOptional({ type: Number, required: false })
  @IsOptional()
  user_id: number;

  @ApiPropertyOptional({ type: String, required: false })
  @IsOptional()
  email: string;
}
