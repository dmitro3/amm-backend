export enum LatestBlockType {
  trade = 'trade',
  offer = 'offer',
  tradeOffer = 'trade_offer', // update offer status when receiving new trade
  Operations = 'operations',
  PoolSwaps = 'pool_swaps',
  Pnls = 'pnls',
  PoolPnls = 'pool_pnls',
  NormalMailNotification = 'normal_mail_notification',
  SystemMailNotification = 'system_mail_notification',
}

export enum LatestBlockCoin {
  stellar = 'stellar',
  bsc = 'bsc',
  None = 'none',
}
