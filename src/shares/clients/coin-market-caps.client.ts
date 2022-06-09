import { HttpClient } from 'src/shares/clients/https.client';
import { AxiosRequestConfig } from 'axios';
import { getConfig } from 'src/configs';
import { CronException } from 'src/shares/exceptions/crons.exception';

export class CoinMarketCapsClient extends HttpClient {
  public static instance;

  private constructor() {
    const configs: AxiosRequestConfig = {
      baseURL: getConfig().get<string>('coinmarketcap.base_url'),
      headers: {
        'X-CMC_PRO_API_KEY': getConfig().get<string>('coinmarketcap.api_key'),
        Accept: 'application/json',
      },
      timeout: 5000,
    };
    super(configs);
  }

  public static getInstance(): CoinMarketCapsClient {
    if (!CoinMarketCapsClient.instance) {
      CoinMarketCapsClient.instance = new CoinMarketCapsClient();
    }
    return CoinMarketCapsClient.instance;
  }

  // eslint-disable-next-line
  async getPrice(listTokens: string[], base: string): Promise<any> {
    const pathURL = getConfig().get<string>('coinmarketcap.prefix_get_price');
    return this.client.get(pathURL, {
      params: {
        symbol: listTokens.join(','),
        convert: base,
      },
    });
  }

  handleResponse(resData) {
    if (this.hasError(resData)) {
      throw new CronException('Cannot get data from coin-market-cap');
    }
    return resData.data;
  }

  hasError(resData): boolean {
    if (!resData || !resData.status || !resData.data) {
      return true;
    }
    if (resData.status.error_code != 0) {
      return true;
    }
    return false;
  }
}
