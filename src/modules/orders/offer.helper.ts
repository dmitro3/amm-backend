import { BigNumber } from 'bignumber.js';
import { PairCoin } from 'src/modules/trades/dto/pair-coin.dto';
import { StellarAsset } from 'src/shares/interfaces/stellar-asset';
import { convertToStellarAsset, xor } from 'src/shares/helpers/stellar';
import { StellarAssetTypeString } from 'src/shares/constants/constant';
import { StellarOffer } from 'src/shares/interfaces/stellar-offer';
import { StellarTrade } from 'src/shares/interfaces/stellar-trade';

export function getOfferAccount(offer: StellarOffer, trades: StellarTrade[], offerId: string): string {
  if (offer.seller) {
    return offer.seller;
  }

  for (const trade of trades) {
    if (trade.base_offer_id === offerId) {
      return trade.base_account;
    }
    if (trade.counter_offer_id === offerId) {
      return trade.counter_account;
    }
  }

  return undefined;
}

export function getOfferAmount(offer: StellarOffer, pair: PairCoin): string {
  if (offer.amount) {
    const { d, n } = offer.price_r;
    if (this.isBaseAsset(offer.selling, pair) && this.isTargetAsset(offer.buying, pair)) {
      return offer.amount;
    } else {
      return new BigNumber(offer.amount).div(d).multipliedBy(n).toString();
    }
  } else {
    return undefined;
  }
}

export function getOfferPrice(offer: StellarOffer, trades: StellarTrade[], pair: PairCoin): string {
  if (offer.price_r) {
    const { d, n } = offer.price_r;
    if (this.isBaseAsset(offer.selling, pair) && this.isTargetAsset(offer.buying, pair)) {
      return new BigNumber(n).div(d).toString();
    } else {
      return new BigNumber(d).div(n).toString();
    }
  }
  return getAverage(trades, pair);
}

export function getAverage(trades: StellarTrade[], pair: PairCoin): string {
  if (trades.length === 0) {
    return undefined;
  }
  let baseAmount = new BigNumber('0');
  let counterAmount = new BigNumber('0');
  let isSameAssetOrder = false;
  for (const trade of trades) {
    baseAmount = baseAmount.plus(trade.base_amount);
    counterAmount = counterAmount.plus(trade.counter_amount);
    isSameAssetOrder = isTargetAsset(getTargetAsset(trade), pair);
  }
  if (isSameAssetOrder) {
    return new BigNumber(counterAmount).div(baseAmount).toString();
  } else {
    return new BigNumber(baseAmount).div(counterAmount).toString();
  }
}

export function getOfferMaker(offer: StellarOffer, trades: StellarTrade[], offerId: string): string {
  if (offer.seller) {
    return offer.seller;
  }
  for (const trade of trades) {
    return trade.base_offer_id === offerId ? trade.base_account : trade.counter_account;
  }
}

export function isBuyOffer(offer: StellarOffer, trades: StellarTrade[], offerId: string, pair: PairCoin): boolean {
  if (offer.buying && offer.selling) {
    return this.isBaseAsset(offer.buying, pair) && this.isTargetAsset(offer.selling, pair);
  }

  if (trades.length > 0) {
    const trade = trades[0];
    return xor([trade.base_offer_id === offerId, isBaseAsset(getBaseAsset(trade), pair)]);
    // if (trade.base_is_seller) {
    //   if (trade.base_offer_id === offerId) {
    //     if (isTargetAsset(getTargetAsset(trade), pair)) {
    //       return false;
    //     } else {
    //       return true;
    //     }
    //   }
    // } else {
    //   return trade.counter_offer_id === offerId;
    // }
  }

  return false;
}

export function getFilledAmounts(trades: StellarTrade[], pair: PairCoin): string {
  if (trades.length === 0) {
    return '0';
  }

  const trade = trades[0];
  const isSameAssetOrder = isBaseAsset(getBaseAsset(trade), pair);
  const field = isSameAssetOrder ? 'base_amount' : 'counter_amount';
  return trades
    .reduce((filledAmount: BigNumber, trade) => filledAmount.plus(trade[field]), new BigNumber('0'))
    .toString();
}

export function getFilledTotal(trades: StellarTrade[], pair: PairCoin): string {
  if (trades.length === 0) {
    return '0';
  }

  const trade = trades[0];
  const isSameAssetOrder = isBaseAsset(getBaseAsset(trade), pair);
  const field = isSameAssetOrder ? 'counter_amount' : 'base_amount';
  return trades
    .reduce((filledAmount: BigNumber, trade) => filledAmount.plus(trade[field]), new BigNumber('0'))
    .toString();
}

export function getCreatedAt(offer: StellarOffer, trades: StellarTrade[]): Date {
  if (offer.last_modified_time) {
    return new Date(offer.last_modified_time);
  }

  if (trades.length > 0) {
    const trade = trades[0];
    return new Date(trade.ledger_close_time);
  }
}

export function isBaseAsset(asset: StellarAsset, pair: PairCoin): boolean {
  if (convertToStellarAsset(pair.base_type) !== asset.asset_type) {
    return false;
  }
  if (asset.asset_type !== StellarAssetTypeString.Native) {
    if (pair.base_symbol !== asset.asset_code) {
      return false;
    }
    if (pair.base_stellar_issuer !== asset.asset_issuer) {
      return false;
    }
  }
  return true;
}

export function isTargetAsset(asset: StellarAsset, pair: PairCoin): boolean {
  if (convertToStellarAsset(pair.quote_type) !== asset.asset_type) {
    return false;
  }

  if (asset.asset_type !== StellarAssetTypeString.Native) {
    if (pair.quote_symbol !== asset.asset_code) {
      return false;
    }
    if (pair.quote_stellar_issuer !== asset.asset_issuer) {
      return false;
    }
  }
  return true;
}

export function getBaseAsset(trade: StellarTrade): StellarAsset {
  return {
    asset_type: trade.base_asset_type,
    asset_code: trade.base_asset_code,
    asset_issuer: trade.base_asset_issuer,
  };
}

export function getTargetAsset(trade: StellarTrade): StellarAsset {
  return {
    asset_type: trade.counter_asset_type,
    asset_code: trade.counter_asset_code,
    asset_issuer: trade.counter_asset_issuer,
  };
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function getBuyingAssetFromOperation(data): StellarAsset {
  return {
    asset_type: data.buying_asset_type,
    asset_code: data.buying_asset_code,
    asset_issuer: data.buying_asset_issuer,
  };
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function getSellingAssetFromOperation(data): StellarAsset {
  return {
    asset_type: data.selling_asset_type,
    asset_code: data.selling_asset_code,
    asset_issuer: data.selling_asset_issuer,
  };
}
