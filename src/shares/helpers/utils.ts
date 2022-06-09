import { ONE_SECOND_MS, TEN_MINUTES_MS } from 'src/shares/constants/constant';
import { BigNumber, hexUtils } from '@0x/utils';
import { TEN, TX_DEFAULTS } from 'src/modules/contracts/constants';
import { LimitOrder, LimitOrderFields } from '@0x/protocol-utils';
import { OrderEntity } from 'src/models/entities/order.entity';
import { CreateOrderDto } from 'src/modules/orders/dto/create_order.dto';
import { ORDER_POOL } from 'src/modules/orders/orders.const';

export const getRandomFutureDateInSeconds = (): BigNumber => {
  return new BigNumber(Date.now() + TEN_MINUTES_MS).div(ONE_SECOND_MS).integerValue(BigNumber.ROUND_CEIL);
};

export const calculateProtocolFee = (
  orders: LimitOrder[],
  gasPrice: BigNumber | number = TX_DEFAULTS.gasPrice,
): BigNumber => {
  return new BigNumber(150000).times(gasPrice).times(orders.length);
};

export const genRandomSixDigit = (): number => {
  return Math.floor(100000 + Math.random() * 900000);
};

export const toBaseUnitAmount = (amount: BigNumber | number, decimals: number): BigNumber => {
  const unit = TEN.pow(decimals);
  return unit.times(amount);
};

export function createOrder(fields: Partial<LimitOrderFields> = {}): LimitOrder {
  return new LimitOrder({
    makerToken: '0x0000000000000000000000000000000000000000',
    takerToken: '0x0000000000000000000000000000000000000000',
    makerAmount: new BigNumber(0),
    takerAmount: new BigNumber(0),
    takerTokenFeeAmount: new BigNumber(0),
    maker: '0x0000000000000000000000000000000000000000',
    taker: '0x0000000000000000000000000000000000000000',
    sender: '0x0000000000000000000000000000000000000000',
    feeRecipient: '0x0000000000000000000000000000000000000000',
    pool: hexUtils.random(),
    expiry: new BigNumber(Math.floor(Date.now() / 1000 + 3600 * 12000)),
    salt: new BigNumber(hexUtils.random()),
    ...fields,
  });
}

export function createLimitOrder(
  order: OrderEntity | CreateOrderDto,
  matcherAddress: string,
  chainId: number,
  verifyingContract: string,
): LimitOrder {
  return createOrder({
    chainId: chainId,
    verifyingContract: verifyingContract,
    makerToken: order.maker_token,
    takerToken: order.taker_token,
    makerAmount: new BigNumber(order.maker_amounts),
    takerAmount: new BigNumber(order.taker_amounts),
    maker: order.maker, // Hard code
    sender: matcherAddress,
    takerTokenFeeAmount: new BigNumber(order.taker_token_fee_amounts),
    salt: new BigNumber(order.salt),
    pool: ORDER_POOL,
    expiry: new BigNumber(order.expiry),
    feeRecipient: matcherAddress,
  });
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function divMod(numerator: string, denominator: string): BigNumber {
  return new BigNumber(new BigNumber(numerator).div(denominator).plus(new BigNumber(denominator).mod(denominator)));
}
