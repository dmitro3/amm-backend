import { getConfig } from 'src/configs/index';

export interface TickerConfig {
  interval: number;
}

export const tickerConfig: TickerConfig = {
  ...getConfig().get<TickerConfig>('ticker'),
};
