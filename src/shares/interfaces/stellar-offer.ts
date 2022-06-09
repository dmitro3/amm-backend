export interface StellarOffer {
  id: string;
  paging_token: string;
  seller: string;
  selling: {
    asset_type: string;
    asset_code?: string;
    asset_issuer?: string;
  };
  buying: {
    asset_type: string;
    asset_code?: string;
    asset_issuer?: string;
  };
  amount: string;
  price_r: {
    n: number;
    d: number;
  };
  price: string;
  last_modified_ledger: number;
  last_modified_time: string;
}
