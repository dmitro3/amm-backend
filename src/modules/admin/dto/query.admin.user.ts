import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class SearchUserByAdminDto {
  // optional user approved/reject by admin
  @ApiPropertyOptional({ type: Number, required: false })
  @IsOptional()
  user_type: number;

  @ApiPropertyOptional({ type: Number, required: false })
  @IsOptional()
  status: number;

  @ApiPropertyOptional({ type: String, required: false })
  @IsOptional()
  user_id: string;

  @ApiPropertyOptional({ type: String, required: false })
  @IsOptional()
  email: string;

  @ApiPropertyOptional({ type: String, required: false })
  @IsOptional()
  create_at_sort: 'ASC' | 'DESC';

  @ApiPropertyOptional({ type: String, required: false })
  @IsOptional()
  created_at: 'ASC' | 'DESC';

  // optional user_regitration
  @ApiPropertyOptional({ type: Number, required: false })
  @IsOptional()
  user_registration: number;

  // optional ủe role
  @ApiPropertyOptional({ type: Number, required: false })
  @IsOptional()
  user_role: number;
}
