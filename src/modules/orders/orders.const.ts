import { getConfig } from 'src/configs';

export enum OrderStatus {
  Invalid = -2,
  Pending = 0, // Pending order waiting for lock balance
  Canceled = -1, // Cancel order
  Fillable = 1, // Order waiting for exchange
  Filling = 2, // Order in exchange processing with another order
  Fulfill = 3, // Order is done}
  PartiallyFilled = 4,
}

export enum OrderSide {
  Buy = 1,
  Sell = 2,
}

export enum OrderType {
  Limit = 1,
  Market = 2,
}

export enum TimeInForce {
  GTC = 1, // Good-til-cancel
  GFD = 2, // Good-for-day
}

export const STELLAR_LIMIT = 200;
export const STELLAR_SLEEP_TIME = 1000;
export const BSC_BLOCK_TIME = 3000;
export const BSC_STEP_BLOCK = 5000;

export const ERC20ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function transfer(address to, uint amount) returns (boolean)',
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function deposit() public payable',
];

export const contractAddress = {
  erc20Proxy: getConfig().get<string>('erc20_proxy'),
  erc721Proxy: getConfig().get<string>('default_property_contract_value'),
  erc1155Proxy: getConfig().get<string>('default_property_contract_value'),
  zrxToken: getConfig().get<string>('zrx_token'),
  etherToken: getConfig().get<string>('default_property_contract_value'),
  exchange: getConfig().get<string>('default_property_contract_value'),
  assetProxyOwner: getConfig().get<string>('default_property_contract_value'),
  erc20BridgeProxy: getConfig().get<string>('default_property_contract_value'),
  zeroExGovernor: getConfig().get<string>('default_property_contract_value'),
  forwarder: getConfig().get<string>('default_property_contract_value'),
  coordinatorRegistry: getConfig().get<string>('default_property_contract_value'),
  coordinator: getConfig().get<string>('default_property_contract_value'),
  multiAssetProxy: getConfig().get<string>('default_property_contract_value'),
  staticCallProxy: getConfig().get<string>('static_call_proxy'),
  devUtils: getConfig().get<string>('default_property_contract_value'),
  exchangeV2: getConfig().get<string>('default_property_contract_value'),
  zrxVault: getConfig().get<string>('zrx_vault'),
  staking: getConfig().get<string>('default_property_contract_value'),
  stakingProxy: getConfig().get<string>('default_property_contract_value'),
  erc20BridgeSampler: getConfig().get<string>('default_property_contract_value'),
  chaiBridge: getConfig().get<string>('default_property_contract_value'),
  dydxBridge: getConfig().get<string>('default_property_contract_value'),
  godsUnchainedValidator: getConfig().get<string>('default_property_contract_value'),
  broker: getConfig().get<string>('default_property_contract_value'),
  chainlinkStopLimit: getConfig().get<string>('default_property_contract_value'),
  maximumGasPrice: getConfig().get<string>('default_property_contract_value'),
  dexForwarderBridge: getConfig().get<string>('default_property_contract_value'),
  exchangeProxyGovernor: getConfig().get<string>('default_property_contract_value'),
  exchangeProxy: getConfig().get<string>('exchange_proxy'),
  exchangeProxyTransformerDeployer: getConfig().get<string>('exchange_proxy_transformer_deployer'),
  exchangeProxyFlashWallet: getConfig().get<string>('exchange_proxy_flash_wallet'),
  exchangeProxyLiquidityProviderSandbox: getConfig().get<string>('default_property_contract_value'),
  transformers: {
    wethTransformer: getConfig().get<string>('default_property_contract_value'),
    payTakerTransformer: getConfig().get<string>('pay_taker_transformer'),
    fillQuoteTransformer: getConfig().get<string>('default_property_contract_value'),
    affiliateFeeTransformer: getConfig().get<string>('affiliate_fee_transformer'),
    positiveSlippageFeeTransformer: getConfig().get<string>('positive_slippage_fee_transformer'),
  },
  ABCToken: getConfig().get<string>('abc_token'),
  registry: getConfig().get<string>('registry'),
  ownable: getConfig().get<string>('ownable'),
  transformERC20: getConfig().get<string>('transform_erc20'),
  metaTransactions: getConfig().get<string>('meta_transactions'),
  nativeOrders: getConfig().get<string>('native_orders'),
  matchOrders: getConfig().get<string>('match_orders'),
  limitOrder: getConfig().get<string>('limit_order'),
};

export const ORDER_LIST_LIMIT = 8;

export enum OrderErrorStatus {
  NotExist = 'NOT_EXIST',
  Unauthorized = 'UNAUTHORIZED',
  AlreadyCancel = 'ALREADY_CANCEL',
  AlreadyFulfill = 'ALREADY_FULFILL',
  InvalidHash = 'INVALID_HASH',
  InvalidSide = 'INVALID_SIDE',
  InvalidTakerAmount = 'INVALID_TAKER_AMOUNT',
  InvalidMakerAmount = 'INVALID_MAKER_AMOUNT',
  FailedCreated = 'FAILED_CREATED',
  InvalidValue = 'INVALID_VALUE',
  InvalidTakerTokenFee = 'INVALID_TAKER_TOKEN_FEE',
  InvalidSender = 'INVALID_SENDER',
  InvalidMaker = 'INVALID_MAKER',
  InvalidPairId = 'INVALID_PAIR_ID',
  InvalidStellarOrder = 'INVALID_STELLAR_ORDER',
  OnlyCancelBSC = 'ONLY_CANCEL_BSC',
  InvalidMethod = 'INVALID_METHOD',
}

export const ORDER_POOL = '0x0000000000000000000000000000000000000000000000000000000000000000';
export const STELLAR_ACCEPT_NUMBER_OF_DECIMAL = 7;
