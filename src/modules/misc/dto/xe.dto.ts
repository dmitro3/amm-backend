export interface XeResponseError {
  code: number;
  message: string;
  documentation_url: string;
}

export interface ExchangeRate {
  coin: string;
  rate: number;
}
