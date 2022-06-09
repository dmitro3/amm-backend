import { StellarAssetTypeNumber, StellarAssetTypeString } from 'src/shares/constants/constant';
import { PairCoin } from 'src/modules/trades/dto/pair-coin.dto';

export function convertToPairMap(pairs: PairCoin[]): { [key: string]: PairCoin } {
  const pairMap = {};

  pairs.forEach((item: PairCoin) => {
    let baseKey;
    let counterKey;
    if (item.base_type === StellarAssetTypeNumber.Native) {
      baseKey = `native__`;
    } else {
      baseKey = `credit_alphanum4_${item.base_symbol}_${item.base_stellar_issuer}`;
    }
    if (item.quote_type === StellarAssetTypeNumber.Native) {
      counterKey = `native__`;
    } else {
      counterKey = `credit_alphanum4_${item.quote_symbol}_${item.quote_stellar_issuer}`;
    }
    const baseCounter = `${baseKey}_${counterKey}`;
    const counterBase = `${counterKey}_${baseKey}`;
    pairMap[baseCounter] = item;
    pairMap[counterBase] = item;
  });

  return pairMap;
}

export function convertToStellarAsset(n: number): string {
  switch (n) {
    case StellarAssetTypeNumber.Native:
      return StellarAssetTypeString.Native;
    case StellarAssetTypeNumber.CreditAlphanum4:
      return StellarAssetTypeString.CreditAlphanum4;
    case StellarAssetTypeNumber.CreditAlphanum12:
      return StellarAssetTypeString.CreditAlphanum12;
    default:
      throw new Error(`Unknown stellar asset type ${n}`);
  }
}

export function xor(array: boolean[]): boolean {
  if (array.length < 1) {
    return false;
  }
  const numbers = array.map((a) => (a ? 1 : 0));
  let result = numbers[0];
  for (let i = 1; i < numbers.length; i++) {
    result = result ^ numbers[i];
  }

  return result === 1;
}
