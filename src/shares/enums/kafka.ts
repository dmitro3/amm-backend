export enum KafkaGroup {
  Ticker = 'ticker',
  StellarOrderbook = 'stellar_orderbook',
  StellarTickerOrderbook = 'stellar_ticker_orderbook',
  BscTickerOrderbook = 'bsc_ticker_orderbook',
  PoolSwapFee = 'pool_swap_fee',
}

export enum KafkaTopic {
  StellarOrderbook = 'stellar_orderbook',
  BscOrderbook = 'bsc_orderbook',
  PoolSwapFee = 'pool_swap_fee',
}
