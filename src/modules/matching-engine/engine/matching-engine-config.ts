import { InputDriver } from 'src/modules/matching-engine/enum/input-driver';
import { OutputDriver } from 'src/modules/matching-engine/enum/output-driver';
import { InputStream } from 'src/modules/matching-engine/input/input-stream';
import { OrderInput } from 'src/modules/matching-engine/entity/order-input';
import { OutputStream } from 'src/modules/matching-engine/output/output-stream';
import { OrderOutput } from 'src/modules/matching-engine/entity/order-output';
import { OrderbookOutput } from 'src/modules/matching-engine/entity/orderbook-output';

export class MatchingEngineConfig {
  private _isTesting = false;
  private _sleepTime = 20; // 20 ms

  private _orderInputDriver: InputDriver;
  private _orderInputQueueName: string;
  private _orderOutputDriver: OutputDriver;
  private _orderOutputQueueName: string;
  private _orderbookOutputDriver: OutputDriver;
  private _orderbookOutputQueueName: string;

  private _orderInputStream: InputStream<OrderInput>;
  private _orderOutputStream: OutputStream<OrderOutput>;
  private _orderbookOutputStream: OutputStream<OrderbookOutput>;

  constructor(orderInputDriver: InputDriver, orderOutputDriver: OutputDriver, orderbookOutputDriver: OutputDriver) {
    this._orderInputDriver = orderInputDriver;
    this._orderOutputDriver = orderOutputDriver;
    this._orderbookOutputDriver = orderbookOutputDriver;
  }

  get isTesting(): boolean {
    return this._isTesting;
  }

  set isTesting(value: boolean) {
    this._isTesting = value;
  }

  get sleepTime(): number {
    return this._sleepTime;
  }

  set sleepTime(value: number) {
    this._sleepTime = value;
  }

  get orderInputDriver(): InputDriver {
    return this._orderInputDriver;
  }

  set orderInputDriver(value: InputDriver) {
    this._orderInputDriver = value;
  }

  get orderInputQueueName(): string {
    return this._orderInputQueueName;
  }

  set orderInputQueueName(value: string) {
    this._orderInputQueueName = value;
  }

  get orderOutputDriver(): OutputDriver {
    return this._orderOutputDriver;
  }

  set orderOutputDriver(value: OutputDriver) {
    this._orderOutputDriver = value;
  }

  get orderOutputQueueName(): string {
    return this._orderOutputQueueName;
  }

  set orderOutputQueueName(value: string) {
    this._orderOutputQueueName = value;
  }

  get orderbookOutputDriver(): OutputDriver {
    return this._orderbookOutputDriver;
  }

  set orderbookOutputDriver(value: OutputDriver) {
    this._orderbookOutputDriver = value;
  }

  get orderbookOutputQueueName(): string {
    return this._orderbookOutputQueueName;
  }

  set orderbookOutputQueueName(value: string) {
    this._orderbookOutputQueueName = value;
  }

  get orderInputStream(): InputStream<OrderInput> {
    return this._orderInputStream;
  }

  set orderInputStream(value: InputStream<OrderInput>) {
    this._orderInputStream = value;
  }

  get orderOutputStream(): OutputStream<OrderOutput> {
    return this._orderOutputStream;
  }

  set orderOutputStream(value: OutputStream<OrderOutput>) {
    this._orderOutputStream = value;
  }

  get orderbookOutputStream(): OutputStream<OrderbookOutput> {
    return this._orderbookOutputStream;
  }

  set orderbookOutputStream(value: OutputStream<OrderbookOutput>) {
    this._orderbookOutputStream = value;
  }
}
