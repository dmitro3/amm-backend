import { InputDriver } from 'src/modules/matching-engine/enum/input-driver';
import { InputStream } from 'src/modules/matching-engine/input/input-stream';
import { TickerTrade } from 'src/modules/ticker/ticker.interface';
import { TradingMethod } from 'src/shares/enums/trading-method';
import { Cache } from 'src/modules/ticker/util/cache';

export class TickerEngineConfig {
  private _isTesting = false;

  private _inputDriver: InputDriver;
  private _inputQueueName: string;

  private _inputStream: InputStream<TickerTrade>;

  private _cacheManager: Cache;

  private _pairId: number;
  private _methods: TradingMethod[] = [];

  constructor(inputDriver: InputDriver) {
    this._inputDriver = inputDriver;
  }

  get isTesting(): boolean {
    return this._isTesting;
  }

  set isTesting(value: boolean) {
    this._isTesting = value;
  }

  get inputDriver(): InputDriver {
    return this._inputDriver;
  }

  set inputDriver(value: InputDriver) {
    this._inputDriver = value;
  }

  get inputQueueName(): string {
    return this._inputQueueName;
  }

  set inputQueueName(value: string) {
    this._inputQueueName = value;
  }

  get inputStream(): InputStream<TickerTrade> {
    return this._inputStream;
  }

  set inputStream(value: InputStream<TickerTrade>) {
    this._inputStream = value;
  }

  get cacheManager(): Cache {
    return this._cacheManager;
  }

  set cacheManager(value: Cache) {
    this._cacheManager = value;
  }

  get pairId(): number {
    return this._pairId;
  }

  set pairId(value: number) {
    this._pairId = value;
  }

  get methods(): TradingMethod[] {
    return this._methods;
  }

  set methods(value: TradingMethod[]) {
    this._methods = value;
  }
}
