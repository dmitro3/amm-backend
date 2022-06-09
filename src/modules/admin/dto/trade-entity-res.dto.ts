export class TradeEntityResponse {
  trade_id: number;
  pair_id: number;
  buy_user_id: number;
  sell_user_id: number;
  buy_order_id: number;
  sell_order_id: number;
  buy_amount: string;
  sell_amount: string;
  network: number;
  price: string;
  quote_name: string;
  base_name: string;
  filled: string;
  sell_fee: string;
  buy_fee: string;
  buy_address: string;
  sell_address: string;
  pool_id: string;
  created_at: Date;
  updated_at: Date;
}
