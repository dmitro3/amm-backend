import { BigNumber } from '@0x/utils';
import { TradingMethod } from 'src/shares/enums/trading-method';

// tslint:disable-next-line:custom-no-magic-numbers
export const ONE_SECOND_MS = 1000;
// tslint:disable-next-line:custom-no-magic-numbers
export const ONE_MINUTE_MS = ONE_SECOND_MS * 60;
// tslint:disable-next-line:custom-no-magic-numbers
export const TEN_MINUTES_MS = ONE_MINUTE_MS * 10;
// tslint:disable-next-line:custom-no-magic-numbers
export const UNLIMITED_ALLOWANCE_IN_BASE_UNITS = new BigNumber(2).pow(256).minus(1);
// tslint:disable-next-line:custom-no-magic-numbers
export const DECIMALS = 18;
export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
export const NULL_BYTES = '0x';
export const ZERO = new BigNumber(0);
export const ONE_HOUR_IN_MINUTE = 60;
export const ONE_DAY = ONE_HOUR_IN_MINUTE * 24;
export const ONE_MONTH = ONE_DAY * 30;
export const ONE_YEAR = 365 * 24 * 60;

export const EXCLUDE_LOG_PATHS = ['/api/v1/ping'];

export enum StellarAssetTypeNumber {
  Native = 1,
  CreditAlphanum4 = 2,
  CreditAlphanum12 = 3,
}

export enum StellarAssetTypeString {
  Native = 'native',
  CreditAlphanum4 = 'credit_alphanum4',
  CreditAlphanum12 = 'credit_alphanum12',
}

export const CRON_ERROR_CODE = 5000;

export enum IsActive {
  Active = 1,
  Inactive = 2,
}

export const ZERO_BN = new BigNumber(0);

export const PERCENT_NUMBER_REGEX = '(^[0-9]{1,9}.[0-9]{1,9})';

export const TRADING_FEE = {
  LIMIT_ORDER: 'Limit Order',
  MARKET_ORDER: 'Market Order',
};

export const TRADING_METHOD_FILTER = [
  {
    value: TradingMethod.StellarOrderbook,
    label: 'Stellar OB',
    symbol: 'OB',
  },
  {
    value: TradingMethod.BSCOrderbook,
    label: 'BSC OB',
    symbol: 'OB',
  },
  {
    value: TradingMethod.BSCPool,
    label: 'BSC LP',
    symbol: 'LP',
  },
];

export const DownloadCollectedFeeColum = ['Pair name', 'Date', 'Trading method', 'Collected fees'];
