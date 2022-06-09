export enum WalletStatus {
  Approved = 1,
  Pending = 2,
  Submit = 3,
  Blocked = 4,
}

export const WALLET_STATUS = [WalletStatus.Approved, WalletStatus.Blocked, WalletStatus.Pending];
export const ACTIVE_WALLET = 1;
export const DEFAULT_LIMIT = 100;
