import { BigNumber } from '@0x/utils';
import { Cache } from 'cache-manager';
import { Producer } from 'kafkajs';
import { kafka } from 'src/configs/kafka';
import { BaseOutputStream } from 'src/modules/matching-engine/output/base-output-stream';
import { OrderbookOutput } from 'src/modules/matching-engine/entity/orderbook-output';
import { isEqual } from 'src/modules/matching-engine/util/helper';
import { OrderSide } from 'src/modules/orders/orders.const';
import { Emitter } from 'src/modules/matching-engine/util/emitter';
import { KafkaTopic } from 'src/shares/enums/kafka';

export interface OrderbookRow {
  price: string;
  amount: string;
}

export interface Orderbook {
  bids: OrderbookRow[];
  asks: OrderbookRow[];
  updated_at: number;
}

export interface OrderbookUpdates {
  data: OrderbookOutput[];
  last_updated_at: number;
  updated_at: number;
}

export class RedisOrderbookStream extends BaseOutputStream<OrderbookOutput> {
  private cacheManager: Cache;
  private emitter: Emitter;
  private producer: Producer;
  private readonly pairId: number;
  private bids: OrderbookOutput[] = [];
  private asks: OrderbookOutput[] = [];
  private updatedAt: number;

  constructor(pairId: number, cacheManager: Cache, emitter: Emitter) {
    super();
    this.pairId = pairId;
    this.cacheManager = cacheManager;
    this.emitter = emitter;
    this.producer = kafka.producer();
  }

  public buildOrderbook(): Orderbook {
    return {
      bids: this.bids.map((row) => ({ price: row.price, amount: row.amount })),
      asks: this.asks.map((row) => ({ price: row.price, amount: row.amount })),
      updated_at: this.updatedAt,
    };
  }

  public async connect(): Promise<boolean> {
    const orderbookKey = RedisOrderbookStream.getOrderbookKey(this.pairId);
    // clear old orderbook when start matching engine
    await this.cacheManager.set(orderbookKey, this.buildOrderbook(), { ttl: Number.MAX_SAFE_INTEGER });
    await this.producer.connect();
    return true;
  }

  public async publish(newRow: OrderbookOutput): Promise<void> {
    const idBidRow = newRow.side === OrderSide.Buy;
    const rows = idBidRow ? this.bids : this.asks;
    const [index, currentBid] = this.findCurrentRow(rows, newRow.price, idBidRow);
    if (!currentBid) {
      // add new row
      rows.splice(index, 0, newRow);
    } else {
      // update current row
      const updatedRow = this.combineRow(currentBid, newRow);
      if (isEqual(updatedRow.amount, '0')) {
        rows.splice(index, 1);
      } else {
        rows[index] = updatedRow;
      }
    }

    const lastUpdatedAt = this.updatedAt;
    this.updatedAt = Date.now();
    const orderbookKey = RedisOrderbookStream.getOrderbookKey(this.pairId);
    await this.cacheManager.set(orderbookKey, this.buildOrderbook(), { ttl: Number.MAX_SAFE_INTEGER });
    this.emitter.emitOrderbook(
      {
        data: [newRow],
        last_updated_at: lastUpdatedAt,
        updated_at: this.updatedAt,
      },
      this.pairId,
    );
    await this.producer.send({
      topic: KafkaTopic.BscOrderbook,
      messages: [{ value: this.pairId.toString() }],
    });
  }

  private combineRow(currentRow: OrderbookOutput, newRow: OrderbookOutput): OrderbookOutput {
    return new OrderbookOutput(
      currentRow.side,
      currentRow.price,
      new BigNumber(currentRow.amount).plus(newRow.amount).toString(),
    );
  }

  private findCurrentRow(rows: OrderbookOutput[], price: string, isBidRow: boolean): [number, OrderbookOutput] {
    if (rows.length === 0) {
      return [-1, undefined];
    }

    const priceBN = new BigNumber(price);

    const bidCount = rows.length;
    for (let i = 0; i < bidCount; i++) {
      if (priceBN.comparedTo(rows[i].price) === 0) {
        return [i, rows[i]];
      }
      const isNewBidRow = isBidRow && priceBN.comparedTo(rows[i].price) > 0;
      const isNewAskRow = !isBidRow && priceBN.comparedTo(rows[i].price) < 0;
      if (isNewBidRow || isNewAskRow) {
        return [i, undefined];
      }
    }

    return [bidCount, undefined];
  }

  public static getOrderbookKey(pairId: number): string {
    return `orderbook_${pairId}`;
  }
}
