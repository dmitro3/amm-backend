export interface PnlsPrimaryKeyDto {
  date;
  user_id;
  wallet;
  symbol;
}

export interface PoolPnlsPrimaryKeyDto {
  date;
  user_id;
  wallet;
  symbol;
  pool_id;
}

export interface UpdateTradeAmountDto {
  incomeSymbol: string;
  outcomeSymbol: string;
  fillAmount: string;
  price: string;
  orderId: number;
  createdTrade: Date;
  userId: number;
  orderSide: number;
}
