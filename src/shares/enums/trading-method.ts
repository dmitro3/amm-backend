export enum TradingMethod {
  StellarOrderbook = 1,
  BSCOrderbook = 2,
  BSCPool = 4,
  CombinedOrderbook = TradingMethod.StellarOrderbook | TradingMethod.BSCOrderbook,
  All = TradingMethod.StellarOrderbook | TradingMethod.BSCOrderbook | TradingMethod.BSCPool,
}
