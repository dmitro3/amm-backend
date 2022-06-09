export class ConfigTokenDTO {
  chainId: string;
  exchangeAddress: string;
  fromAddress: string;
  toAddress: string;
  fromAssetData: string;
  toAssetData: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fromABI: any;
}
