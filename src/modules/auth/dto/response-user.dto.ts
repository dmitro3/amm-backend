export class ResponseUserDto {
  access_token: string;
  refresh_token: string;
  id: number;
  email: string;
  company: string;
  fullname: string;
  phone: string;
  velo_account: string;
  role: number;
  created_at: string;
  listUserFunCurrencies: {
    id: string;
    symbol: string;
    currency_id: string;
  }[];
  IP: string;
  last_login: string;
}
