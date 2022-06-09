import { IntervalSettingsDto } from 'src/modules/users/dto/interval-settings.dto';
export class WrapIntervalSettingsDto {
  intervals: IntervalSettingsDto[];
  filter: { page: number; limit: number };
  adminEmail: string;
  adminId: number;
}
