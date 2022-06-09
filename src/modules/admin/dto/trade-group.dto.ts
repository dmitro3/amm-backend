import { TradeEntityResponse } from 'src/modules/admin/dto/trade-entity-res.dto';
export class TradeGroupDto {
  date: string;
  trades: TradeEntityResponse[];
}
