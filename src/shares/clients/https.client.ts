/* eslint-disable */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export abstract class HttpClient {
  protected readonly client: AxiosInstance;

  protected constructor(config: AxiosRequestConfig) {
    this.client = axios.create(config);

    this._initializeResponseInterceptor();
  }

  private _initializeResponseInterceptor = () => {
    this.client.interceptors.response.use(this._handleResponse, this._handleError);
  };

  private _handleResponse = ({ data }: AxiosResponse) => data;

  protected _handleError = (error: any) => Promise.reject(error);
}
