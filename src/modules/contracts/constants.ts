import { BigNumber } from '@0x/utils';

export const gasLimit = 1000000;
export const TX_DEFAULTS = {
  gas: 8000000,
  gasPrice: 1000000000,
};
export const TEN = new BigNumber(10);

export interface LimitOrder {
  makerToken: string;
  takerToken: string;
  makerAmount: string;
  takerAmount: string;
  maker: string;
  taker: string;
  pool: string;
  expiry: number;
  salt: string;
  chainId: number;
  verifyingContract: string;
  takerTokenFeeAmount: number;
  sender: string;
  feeRecipient: string;
}

export const contractAddress = {
  erc20Proxy: '0x7622ffeb9db0394748a97a000f3c8443e72beac9',
  erc721Proxy: '0x0cae9db1027d6997b34d8595352c1b5fc701dab4',
  erc1155Proxy: '0x26bcba50a9b14e22f4ae6037284339a16e0ada9a',
  zrxToken: '0x1132209e3b7fa51cd8cf45d901c391a9378c093e',
  etherToken: '0x159efd2d8996ce6ca2bcecd002a3a1acdfcd12e0',
  exchange: '0xed0679907492cb51a68e9cf9add7de93974a2560',
  assetProxyOwner: '0x0000000000000000000000000000000000000000',
  erc20BridgeProxy: '0x7f42c5908823ef88fa7e5ee6678ed1c57c2e47c7',
  zeroExGovernor: '0x0000000000000000000000000000000000000000',
  forwarder: '0xbe0bb35ddde24429dc3a1e7b4ed2a6dd97588c0c',
  coordinatorRegistry: '0x7b6b9fda16ccdf34a02361f49998fbc1c292385a',
  coordinator: '0x0a6f3c606add10f39971189fb85018f11b9d9ad7',
  multiAssetProxy: '0x5b48ad5925b53e8d0442627263d733c3cb3e255c',
  staticCallProxy: '0x2bffe7c0cb08e5faf4a95aa2bda587e6f16c20b6',
  devUtils: '0xc7974c083391deb0a1546b0ff2a2e7971abf1d57',
  exchangeV2: '0x48bacb9266a570d521063ef5dd96e61686dbe788',
  zrxVault: '0x9efc79c4bfa2d0f1c14534eeb08831edddbbf311',
  staking: '0x4237487aca86ee8938f8825aa9aee3254efe9565',
  stakingProxy: '0xafe87c044fac9afd5f3ec60c107dce46d51124aa',
  erc20BridgeSampler: '0x0000000000000000000000000000000000000000',
  chaiBridge: '0x0000000000000000000000000000000000000000',
  dydxBridge: '0x0000000000000000000000000000000000000000',
  godsUnchainedValidator: '0x0000000000000000000000000000000000000000',
  broker: '0x0000000000000000000000000000000000000000',
  chainlinkStopLimit: '0x0000000000000000000000000000000000000000',
  maximumGasPrice: '0x0000000000000000000000000000000000000000',
  dexForwarderBridge: '0x0000000000000000000000000000000000000000',
  exchangeProxyGovernor: '0x0000000000000000000000000000000000000000',
  exchangeProxy: '0xc0343abe0c7464455becb800bf9aa7f62ef60108',
  exchangeProxyTransformerDeployer: '0xF54b3294616d39749732Ac74F234F46C9ABf29C4',
  exchangeProxyFlashWallet: '0x255b6f10577b580ebd60a77dcc4c146b2e17c141',
  exchangeProxyLiquidityProviderSandbox: '0x0000000000000000000000000000000000000000',
  transformers: {
    wethTransformer: '0xc93defb560081e23cd888874ca7becf2c7f1819f',
    payTakerTransformer: '0x245a4a8dc9447d13958a160ff79f2cc1d1ff9e4f',
    fillQuoteTransformer: '0x5ae2c4970288493b14877dcf22c84806874d32fb',
    affiliateFeeTransformer: '0xcd7883f64adf8ba6874ba1f912b0a353ac7d5c87',
    positiveSlippageFeeTransformer: '0x0a4704bb772141feeedc125b6e5182d172b89fd5',
  },
  ABCToken: '0xe0a4e3137d479e422f6d8eb674e5f097dba8bbca',
  registry: '0x773e82cd5e5c39acabe47d54dcb8b47a3d62052b',
  ownable: '0xe037ca8f986f2ce5a08c303528456faf4e342fe9',
  transformERC20: '0x6a0ce9d2913b777fb5bde18f1b45c80f4f6eb8c9',
  metaTransactions: '0xedeec8f541d7a276af63b6fa86e03bef3fa2a2b6',
  nativeOrders: '0x2b06f08807eae8b8245cf1bca4e34d0d509e03dd',
  matchOrders: '0xa430ad8b7c2cee4486a65b5ad7c7e4e7c903755b',
};

export enum ContractEvent {
  RoleGranted = 'RoleGranted',
  RoleRevoked = 'RoleRevoked',
  LockedBalanceOrder = 'LockedBalanceOrder',
}
