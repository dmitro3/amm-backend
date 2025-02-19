export const zeroExABI = [
  {
    anonymous: false,
    inputs: [
      {
        name: 'orderHash',
        type: 'bytes32',
        indexed: false,
      },
      {
        name: 'maker',
        type: 'address',
        indexed: false,
      },
      {
        name: 'expiry',
        type: 'uint64',
        indexed: false,
      },
    ],
    name: 'ExpiredRfqOrder',
    outputs: [],
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        name: 'orderHash',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'makerAmountFinal',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'takerAmountFinal',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'feePaid',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Fill',
    outputs: [],
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        name: 'orderHash',
        type: 'bytes32',
        indexed: false,
      },
      {
        name: 'orderLocked',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'LimitOrderCancelled',
    outputs: [],
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        name: 'orderHash',
        type: 'bytes32',
        indexed: false,
      },
      {
        name: 'maker',
        type: 'address',
        indexed: false,
      },
      {
        name: 'taker',
        type: 'address',
        indexed: false,
      },
      {
        name: 'feeRecipient',
        type: 'address',
        indexed: false,
      },
      {
        name: 'makerToken',
        type: 'address',
        indexed: false,
      },
      {
        name: 'takerToken',
        type: 'address',
        indexed: false,
      },
      {
        name: 'takerTokenFilledAmount',
        type: 'uint128',
        indexed: false,
      },
      {
        name: 'makerTokenFilledAmount',
        type: 'uint128',
        indexed: false,
      },
      {
        name: 'takerTokenFeeFilledAmount',
        type: 'uint128',
        indexed: false,
      },
      {
        name: 'protocolFeePaid',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'pool',
        type: 'bytes32',
        indexed: false,
      },
    ],
    name: 'LimitOrderFilled',
    outputs: [],
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        name: 'inputToken',
        type: 'address',
        indexed: false,
      },
      {
        name: 'outputToken',
        type: 'address',
        indexed: false,
      },
      {
        name: 'inputTokenAmount',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'outputTokenAmount',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'provider',
        type: 'address',
        indexed: false,
      },
      {
        name: 'recipient',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'LiquidityProviderSwap',
    outputs: [],
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        name: 'orderHash',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'makerToken',
        type: 'address',
        indexed: false,
      },
      {
        name: 'takerToken',
        type: 'address',
        indexed: false,
      },
      {
        name: 'makerAddress',
        type: 'address',
        indexed: true,
      },
      {
        name: 'takerAddress',
        type: 'address',
        indexed: false,
      },
      {
        name: 'matchOrderAddress',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'LockedBalanceOrder',
    outputs: [],
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        name: 'hash',
        type: 'bytes32',
        indexed: false,
      },
      {
        name: 'selector',
        type: 'bytes4',
        indexed: true,
      },
      {
        name: 'signer',
        type: 'address',
        indexed: false,
      },
      {
        name: 'sender',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'MetaTransactionExecuted',
    outputs: [],
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        name: 'caller',
        type: 'address',
        indexed: false,
      },
      {
        name: 'migrator',
        type: 'address',
        indexed: false,
      },
      {
        name: 'newOwner',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Migrated',
    outputs: [],
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        name: 'orderHash',
        type: 'bytes32',
        indexed: false,
      },
      {
        name: 'maker',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'OrderCancelled',
    outputs: [],
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        name: 'maker',
        type: 'address',
        indexed: false,
      },
      {
        name: 'signer',
        type: 'address',
        indexed: false,
      },
      {
        name: 'allowed',
        type: 'bool',
        indexed: false,
      },
    ],
    name: 'OrderSignerRegistered',
    outputs: [],
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
    outputs: [],
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        name: 'maker',
        type: 'address',
        indexed: false,
      },
      {
        name: 'makerToken',
        type: 'address',
        indexed: false,
      },
      {
        name: 'takerToken',
        type: 'address',
        indexed: false,
      },
      {
        name: 'minValidSalt',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'PairCancelledLimitOrders',
    outputs: [],
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        name: 'maker',
        type: 'address',
        indexed: false,
      },
      {
        name: 'makerToken',
        type: 'address',
        indexed: false,
      },
      {
        name: 'takerToken',
        type: 'address',
        indexed: false,
      },
      {
        name: 'minValidSalt',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'PairCancelledRfqOrders',
    outputs: [],
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        name: 'selector',
        type: 'bytes4',
        indexed: true,
      },
      {
        name: 'oldImpl',
        type: 'address',
        indexed: false,
      },
      {
        name: 'newImpl',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'ProxyFunctionUpdated',
    outputs: [],
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        name: 'quoteSigner',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'QuoteSignerUpdated',
    outputs: [],
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        name: 'orderHash',
        type: 'bytes32',
        indexed: false,
      },
      {
        name: 'maker',
        type: 'address',
        indexed: false,
      },
      {
        name: 'taker',
        type: 'address',
        indexed: false,
      },
      {
        name: 'makerToken',
        type: 'address',
        indexed: false,
      },
      {
        name: 'takerToken',
        type: 'address',
        indexed: false,
      },
      {
        name: 'takerTokenFilledAmount',
        type: 'uint128',
        indexed: false,
      },
      {
        name: 'makerTokenFilledAmount',
        type: 'uint128',
        indexed: false,
      },
      {
        name: 'pool',
        type: 'bytes32',
        indexed: false,
      },
    ],
    name: 'RfqOrderFilled',
    outputs: [],
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        name: 'origin',
        type: 'address',
        indexed: false,
      },
      {
        name: 'addrs',
        type: 'address[]',
        indexed: false,
      },
      {
        name: 'allowed',
        type: 'bool',
        indexed: false,
      },
    ],
    name: 'RfqOrderOriginsAllowed',
    outputs: [],
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        name: 'maker',
        type: 'address',
        indexed: false,
      },
      {
        name: 'matchOrderAddress',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'TransferDone',
    outputs: [],
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        name: 'stt',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'from',
        type: 'address',
        indexed: false,
      },
      {
        name: 'to',
        type: 'address',
        indexed: false,
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'TransferMatchDone',
    outputs: [],
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        name: 'taker',
        type: 'address',
        indexed: true,
      },
      {
        name: 'inputToken',
        type: 'address',
        indexed: false,
      },
      {
        name: 'outputToken',
        type: 'address',
        indexed: false,
      },
      {
        name: 'inputTokenAmount',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'outputTokenAmount',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'TransformedERC20',
    outputs: [],
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        name: 'transformerDeployer',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'TransformerDeployerUpdated',
    outputs: [],
    type: 'event',
  },
  {
    inputs: [
      {
        name: 'order',
        type: 'tuple',
        components: [
          {
            name: 'makerToken',
            type: 'address',
          },
          {
            name: 'takerToken',
            type: 'address',
          },
          {
            name: 'makerAmount',
            type: 'uint128',
          },
          {
            name: 'takerAmount',
            type: 'uint128',
          },
          {
            name: 'takerTokenFeeAmount',
            type: 'uint128',
          },
          {
            name: 'maker',
            type: 'address',
          },
          {
            name: 'taker',
            type: 'address',
          },
          {
            name: 'sender',
            type: 'address',
          },
          {
            name: 'feeRecipient',
            type: 'address',
          },
          {
            name: 'pool',
            type: 'bytes32',
          },
          {
            name: 'expiry',
            type: 'uint64',
          },
          {
            name: 'salt',
            type: 'uint256',
          },
        ],
      },
      {
        name: 'signature',
        type: 'tuple',
        components: [
          {
            name: 'signatureType',
            type: 'uint8',
          },
          {
            name: 'v',
            type: 'uint8',
          },
          {
            name: 'r',
            type: 'bytes32',
          },
          {
            name: 's',
            type: 'bytes32',
          },
        ],
      },
      {
        name: 'takerTokenFillAmount',
        type: 'uint128',
      },
      {
        name: 'taker',
        type: 'address',
      },
      {
        name: 'sender',
        type: 'address',
      },
    ],
    name: '_fillLimitOrder',
    outputs: [
      {
        name: 'takerTokenFilledAmount',
        type: 'uint128',
      },
      {
        name: 'makerTokenFilledAmount',
        type: 'uint128',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'order',
        type: 'tuple',
        components: [
          {
            name: 'makerToken',
            type: 'address',
          },
          {
            name: 'takerToken',
            type: 'address',
          },
          {
            name: 'makerAmount',
            type: 'uint128',
          },
          {
            name: 'takerAmount',
            type: 'uint128',
          },
          {
            name: 'maker',
            type: 'address',
          },
          {
            name: 'taker',
            type: 'address',
          },
          {
            name: 'txOrigin',
            type: 'address',
          },
          {
            name: 'pool',
            type: 'bytes32',
          },
          {
            name: 'expiry',
            type: 'uint64',
          },
          {
            name: 'salt',
            type: 'uint256',
          },
        ],
      },
      {
        name: 'signature',
        type: 'tuple',
        components: [
          {
            name: 'signatureType',
            type: 'uint8',
          },
          {
            name: 'v',
            type: 'uint8',
          },
          {
            name: 'r',
            type: 'bytes32',
          },
          {
            name: 's',
            type: 'bytes32',
          },
        ],
      },
      {
        name: 'takerTokenFillAmount',
        type: 'uint128',
      },
      {
        name: 'taker',
        type: 'address',
      },
    ],
    name: '_fillRfqOrder',
    outputs: [
      {
        name: 'takerTokenFilledAmount',
        type: 'uint128',
      },
      {
        name: 'makerTokenFilledAmount',
        type: 'uint128',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'args',
        type: 'tuple',
        components: [
          {
            name: 'taker',
            type: 'address',
          },
          {
            name: 'inputToken',
            type: 'address',
          },
          {
            name: 'outputToken',
            type: 'address',
          },
          {
            name: 'inputTokenAmount',
            type: 'uint256',
          },
          {
            name: 'minOutputTokenAmount',
            type: 'uint256',
          },
          {
            name: 'transformations',
            type: 'tuple[]',
            components: [
              {
                name: 'deploymentNonce',
                type: 'uint32',
              },
              {
                name: 'data',
                type: 'bytes',
              },
            ],
          },
        ],
      },
    ],
    name: '_transformERC20',
    outputs: [
      {
        name: 'outputTokenAmount',
        type: 'uint256',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'orders',
        type: 'tuple[]',
        components: [
          {
            name: 'makerToken',
            type: 'address',
          },
          {
            name: 'takerToken',
            type: 'address',
          },
          {
            name: 'makerAmount',
            type: 'uint128',
          },
          {
            name: 'takerAmount',
            type: 'uint128',
          },
          {
            name: 'takerTokenFeeAmount',
            type: 'uint128',
          },
          {
            name: 'maker',
            type: 'address',
          },
          {
            name: 'taker',
            type: 'address',
          },
          {
            name: 'sender',
            type: 'address',
          },
          {
            name: 'feeRecipient',
            type: 'address',
          },
          {
            name: 'pool',
            type: 'bytes32',
          },
          {
            name: 'expiry',
            type: 'uint64',
          },
          {
            name: 'salt',
            type: 'uint256',
          },
        ],
      },
    ],
    name: 'batchCancelLimitOrders',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'makerTokens',
        type: 'address[]',
      },
      {
        name: 'takerTokens',
        type: 'address[]',
      },
      {
        name: 'minValidSalts',
        type: 'uint256[]',
      },
    ],
    name: 'batchCancelPairLimitOrders',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'maker',
        type: 'address',
      },
      {
        name: 'makerTokens',
        type: 'address[]',
      },
      {
        name: 'takerTokens',
        type: 'address[]',
      },
      {
        name: 'minValidSalts',
        type: 'uint256[]',
      },
    ],
    name: 'batchCancelPairLimitOrdersWithSigner',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'makerTokens',
        type: 'address[]',
      },
      {
        name: 'takerTokens',
        type: 'address[]',
      },
      {
        name: 'minValidSalts',
        type: 'uint256[]',
      },
    ],
    name: 'batchCancelPairRfqOrders',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'maker',
        type: 'address',
      },
      {
        name: 'makerTokens',
        type: 'address[]',
      },
      {
        name: 'takerTokens',
        type: 'address[]',
      },
      {
        name: 'minValidSalts',
        type: 'uint256[]',
      },
    ],
    name: 'batchCancelPairRfqOrdersWithSigner',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'orders',
        type: 'tuple[]',
        components: [
          {
            name: 'makerToken',
            type: 'address',
          },
          {
            name: 'takerToken',
            type: 'address',
          },
          {
            name: 'makerAmount',
            type: 'uint128',
          },
          {
            name: 'takerAmount',
            type: 'uint128',
          },
          {
            name: 'maker',
            type: 'address',
          },
          {
            name: 'taker',
            type: 'address',
          },
          {
            name: 'txOrigin',
            type: 'address',
          },
          {
            name: 'pool',
            type: 'bytes32',
          },
          {
            name: 'expiry',
            type: 'uint64',
          },
          {
            name: 'salt',
            type: 'uint256',
          },
        ],
      },
    ],
    name: 'batchCancelRfqOrders',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'mtxs',
        type: 'tuple[]',
        components: [
          {
            name: 'signer',
            type: 'address',
          },
          {
            name: 'sender',
            type: 'address',
          },
          {
            name: 'minGasPrice',
            type: 'uint256',
          },
          {
            name: 'maxGasPrice',
            type: 'uint256',
          },
          {
            name: 'expirationTimeSeconds',
            type: 'uint256',
          },
          {
            name: 'salt',
            type: 'uint256',
          },
          {
            name: 'callData',
            type: 'bytes',
          },
          {
            name: 'value',
            type: 'uint256',
          },
          {
            name: 'feeToken',
            type: 'address',
          },
          {
            name: 'feeAmount',
            type: 'uint256',
          },
        ],
      },
      {
        name: 'signatures',
        type: 'tuple[]',
        components: [
          {
            name: 'signatureType',
            type: 'uint8',
          },
          {
            name: 'v',
            type: 'uint8',
          },
          {
            name: 'r',
            type: 'bytes32',
          },
          {
            name: 's',
            type: 'bytes32',
          },
        ],
      },
    ],
    name: 'batchExecuteMetaTransactions',
    outputs: [
      {
        name: 'returnResults',
        type: 'bytes[]',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'fillData',
        type: 'tuple',
        components: [
          {
            name: 'inputToken',
            type: 'address',
          },
          {
            name: 'outputToken',
            type: 'address',
          },
          {
            name: 'sellAmount',
            type: 'uint256',
          },
          {
            name: 'calls',
            type: 'tuple[]',
            components: [
              {
                name: 'selector',
                type: 'bytes4',
              },
              {
                name: 'sellAmount',
                type: 'uint256',
              },
              {
                name: 'data',
                type: 'bytes',
              },
            ],
          },
        ],
      },
      {
        name: 'minBuyAmount',
        type: 'uint256',
      },
    ],
    name: 'batchFill',
    outputs: [
      {
        name: 'outputTokenAmount',
        type: 'uint256',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'orders',
        type: 'tuple[]',
        components: [
          {
            name: 'makerToken',
            type: 'address',
          },
          {
            name: 'takerToken',
            type: 'address',
          },
          {
            name: 'makerAmount',
            type: 'uint128',
          },
          {
            name: 'takerAmount',
            type: 'uint128',
          },
          {
            name: 'takerTokenFeeAmount',
            type: 'uint128',
          },
          {
            name: 'maker',
            type: 'address',
          },
          {
            name: 'taker',
            type: 'address',
          },
          {
            name: 'sender',
            type: 'address',
          },
          {
            name: 'feeRecipient',
            type: 'address',
          },
          {
            name: 'pool',
            type: 'bytes32',
          },
          {
            name: 'expiry',
            type: 'uint64',
          },
          {
            name: 'salt',
            type: 'uint256',
          },
        ],
      },
      {
        name: 'signatures',
        type: 'tuple[]',
        components: [
          {
            name: 'signatureType',
            type: 'uint8',
          },
          {
            name: 'v',
            type: 'uint8',
          },
          {
            name: 'r',
            type: 'bytes32',
          },
          {
            name: 's',
            type: 'bytes32',
          },
        ],
      },
      {
        name: 'takerTokenFillAmounts',
        type: 'uint128[]',
      },
      {
        name: 'revertIfIncomplete',
        type: 'bool',
      },
    ],
    name: 'batchFillLimitOrders',
    outputs: [
      {
        name: 'takerTokenFilledAmounts',
        type: 'uint128[]',
      },
      {
        name: 'makerTokenFilledAmounts',
        type: 'uint128[]',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'orders',
        type: 'tuple[]',
        components: [
          {
            name: 'makerToken',
            type: 'address',
          },
          {
            name: 'takerToken',
            type: 'address',
          },
          {
            name: 'makerAmount',
            type: 'uint128',
          },
          {
            name: 'takerAmount',
            type: 'uint128',
          },
          {
            name: 'maker',
            type: 'address',
          },
          {
            name: 'taker',
            type: 'address',
          },
          {
            name: 'txOrigin',
            type: 'address',
          },
          {
            name: 'pool',
            type: 'bytes32',
          },
          {
            name: 'expiry',
            type: 'uint64',
          },
          {
            name: 'salt',
            type: 'uint256',
          },
        ],
      },
      {
        name: 'signatures',
        type: 'tuple[]',
        components: [
          {
            name: 'signatureType',
            type: 'uint8',
          },
          {
            name: 'v',
            type: 'uint8',
          },
          {
            name: 'r',
            type: 'bytes32',
          },
          {
            name: 's',
            type: 'bytes32',
          },
        ],
      },
      {
        name: 'takerTokenFillAmounts',
        type: 'uint128[]',
      },
      {
        name: 'revertIfIncomplete',
        type: 'bool',
      },
    ],
    name: 'batchFillRfqOrders',
    outputs: [
      {
        name: 'takerTokenFilledAmounts',
        type: 'uint128[]',
      },
      {
        name: 'makerTokenFilledAmounts',
        type: 'uint128[]',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'orders',
        type: 'tuple[]',
        components: [
          {
            name: 'makerToken',
            type: 'address',
          },
          {
            name: 'takerToken',
            type: 'address',
          },
          {
            name: 'makerAmount',
            type: 'uint128',
          },
          {
            name: 'takerAmount',
            type: 'uint128',
          },
          {
            name: 'takerTokenFeeAmount',
            type: 'uint128',
          },
          {
            name: 'maker',
            type: 'address',
          },
          {
            name: 'taker',
            type: 'address',
          },
          {
            name: 'sender',
            type: 'address',
          },
          {
            name: 'feeRecipient',
            type: 'address',
          },
          {
            name: 'pool',
            type: 'bytes32',
          },
          {
            name: 'expiry',
            type: 'uint64',
          },
          {
            name: 'salt',
            type: 'uint256',
          },
        ],
      },
      {
        name: 'signatures',
        type: 'tuple[]',
        components: [
          {
            name: 'signatureType',
            type: 'uint8',
          },
          {
            name: 'v',
            type: 'uint8',
          },
          {
            name: 'r',
            type: 'bytes32',
          },
          {
            name: 's',
            type: 'bytes32',
          },
        ],
      },
    ],
    name: 'batchGetLimitOrderRelevantStates',
    outputs: [
      {
        name: 'orderInfos',
        type: 'tuple[]',
        components: [
          {
            name: 'orderHash',
            type: 'bytes32',
          },
          {
            name: 'status',
            type: 'uint8',
          },
          {
            name: 'makerTokenFilledAmount',
            type: 'uint128',
          },
          {
            name: 'takerTokenFilledAmount',
            type: 'uint128',
          },
        ],
      },
      {
        name: 'actualFillableTakerTokenAmounts',
        type: 'uint128[]',
      },
      {
        name: 'isSignatureValids',
        type: 'bool[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'orders',
        type: 'tuple[]',
        components: [
          {
            name: 'makerToken',
            type: 'address',
          },
          {
            name: 'takerToken',
            type: 'address',
          },
          {
            name: 'makerAmount',
            type: 'uint128',
          },
          {
            name: 'takerAmount',
            type: 'uint128',
          },
          {
            name: 'maker',
            type: 'address',
          },
          {
            name: 'taker',
            type: 'address',
          },
          {
            name: 'txOrigin',
            type: 'address',
          },
          {
            name: 'pool',
            type: 'bytes32',
          },
          {
            name: 'expiry',
            type: 'uint64',
          },
          {
            name: 'salt',
            type: 'uint256',
          },
        ],
      },
      {
        name: 'signatures',
        type: 'tuple[]',
        components: [
          {
            name: 'signatureType',
            type: 'uint8',
          },
          {
            name: 'v',
            type: 'uint8',
          },
          {
            name: 'r',
            type: 'bytes32',
          },
          {
            name: 's',
            type: 'bytes32',
          },
        ],
      },
    ],
    name: 'batchGetRfqOrderRelevantStates',
    outputs: [
      {
        name: 'orderInfos',
        type: 'tuple[]',
        components: [
          {
            name: 'orderHash',
            type: 'bytes32',
          },
          {
            name: 'status',
            type: 'uint8',
          },
          {
            name: 'makerTokenFilledAmount',
            type: 'uint128',
          },
          {
            name: 'takerTokenFilledAmount',
            type: 'uint128',
          },
        ],
      },
      {
        name: 'actualFillableTakerTokenAmounts',
        type: 'uint128[]',
      },
      {
        name: 'isSignatureValids',
        type: 'bool[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'order',
        type: 'tuple',
        components: [
          {
            name: 'makerToken',
            type: 'address',
          },
          {
            name: 'takerToken',
            type: 'address',
          },
          {
            name: 'makerAmount',
            type: 'uint128',
          },
          {
            name: 'takerAmount',
            type: 'uint128',
          },
          {
            name: 'takerTokenFeeAmount',
            type: 'uint128',
          },
          {
            name: 'maker',
            type: 'address',
          },
          {
            name: 'taker',
            type: 'address',
          },
          {
            name: 'sender',
            type: 'address',
          },
          {
            name: 'feeRecipient',
            type: 'address',
          },
          {
            name: 'pool',
            type: 'bytes32',
          },
          {
            name: 'expiry',
            type: 'uint64',
          },
          {
            name: 'salt',
            type: 'uint256',
          },
        ],
      },
    ],
    name: 'cancelLimitOrder',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'orderHash',
        type: 'bytes32',
      },
      {
        name: 'token',
        type: 'address',
      },
      {
        name: 'maker',
        type: 'address',
      },
    ],
    name: 'cancelLimitOrderWithHash',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'makerToken',
        type: 'address',
      },
      {
        name: 'takerToken',
        type: 'address',
      },
      {
        name: 'minValidSalt',
        type: 'uint256',
      },
    ],
    name: 'cancelPairLimitOrders',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'maker',
        type: 'address',
      },
      {
        name: 'makerToken',
        type: 'address',
      },
      {
        name: 'takerToken',
        type: 'address',
      },
      {
        name: 'minValidSalt',
        type: 'uint256',
      },
    ],
    name: 'cancelPairLimitOrdersWithSigner',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'makerToken',
        type: 'address',
      },
      {
        name: 'takerToken',
        type: 'address',
      },
      {
        name: 'minValidSalt',
        type: 'uint256',
      },
    ],
    name: 'cancelPairRfqOrders',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'maker',
        type: 'address',
      },
      {
        name: 'makerToken',
        type: 'address',
      },
      {
        name: 'takerToken',
        type: 'address',
      },
      {
        name: 'minValidSalt',
        type: 'uint256',
      },
    ],
    name: 'cancelPairRfqOrdersWithSigner',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'order',
        type: 'tuple',
        components: [
          {
            name: 'makerToken',
            type: 'address',
          },
          {
            name: 'takerToken',
            type: 'address',
          },
          {
            name: 'makerAmount',
            type: 'uint128',
          },
          {
            name: 'takerAmount',
            type: 'uint128',
          },
          {
            name: 'maker',
            type: 'address',
          },
          {
            name: 'taker',
            type: 'address',
          },
          {
            name: 'txOrigin',
            type: 'address',
          },
          {
            name: 'pool',
            type: 'bytes32',
          },
          {
            name: 'expiry',
            type: 'uint64',
          },
          {
            name: 'salt',
            type: 'uint256',
          },
        ],
      },
    ],
    name: 'cancelRfqOrder',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'typeOrder',
        type: 'uint8',
      },
    ],
    name: 'compare',
    outputs: [
      {
        name: 'sellRemaining',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'order',
        type: 'tuple',
        components: [
          {
            name: 'makerToken',
            type: 'address',
          },
          {
            name: 'takerToken',
            type: 'address',
          },
          {
            name: 'makerAmount',
            type: 'uint128',
          },
          {
            name: 'takerAmount',
            type: 'uint128',
          },
          {
            name: 'takerTokenFeeAmount',
            type: 'uint128',
          },
          {
            name: 'maker',
            type: 'address',
          },
          {
            name: 'taker',
            type: 'address',
          },
          {
            name: 'sender',
            type: 'address',
          },
          {
            name: 'feeRecipient',
            type: 'address',
          },
          {
            name: 'pool',
            type: 'bytes32',
          },
          {
            name: 'expiry',
            type: 'uint64',
          },
          {
            name: 'salt',
            type: 'uint256',
          },
        ],
      },
      {
        name: 'signature',
        type: 'tuple',
        components: [
          {
            name: 'signatureType',
            type: 'uint8',
          },
          {
            name: 'v',
            type: 'uint8',
          },
          {
            name: 'r',
            type: 'bytes32',
          },
          {
            name: 's',
            type: 'bytes32',
          },
        ],
      },
    ],
    name: 'createLimitOrder',
    outputs: [
      {
        name: 'orderInfo',
        type: 'tuple',
        components: [
          {
            name: 'orderHash',
            type: 'bytes32',
          },
          {
            name: 'status',
            type: 'uint8',
          },
          {
            name: 'makerTokenFilledAmount',
            type: 'uint128',
          },
          {
            name: 'takerTokenFilledAmount',
            type: 'uint128',
          },
        ],
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'createTransformWallet',
    outputs: [
      {
        name: 'wallet',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'mtx',
        type: 'tuple',
        components: [
          {
            name: 'signer',
            type: 'address',
          },
          {
            name: 'sender',
            type: 'address',
          },
          {
            name: 'minGasPrice',
            type: 'uint256',
          },
          {
            name: 'maxGasPrice',
            type: 'uint256',
          },
          {
            name: 'expirationTimeSeconds',
            type: 'uint256',
          },
          {
            name: 'salt',
            type: 'uint256',
          },
          {
            name: 'callData',
            type: 'bytes',
          },
          {
            name: 'value',
            type: 'uint256',
          },
          {
            name: 'feeToken',
            type: 'address',
          },
          {
            name: 'feeAmount',
            type: 'uint256',
          },
        ],
      },
      {
        name: 'signature',
        type: 'tuple',
        components: [
          {
            name: 'signatureType',
            type: 'uint8',
          },
          {
            name: 'v',
            type: 'uint8',
          },
          {
            name: 'r',
            type: 'bytes32',
          },
          {
            name: 's',
            type: 'bytes32',
          },
        ],
      },
    ],
    name: 'executeMetaTransaction',
    outputs: [
      {
        name: 'returnResult',
        type: 'bytes',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'selector',
        type: 'bytes4',
      },
      {
        name: 'impl',
        type: 'address',
      },
    ],
    name: 'extend',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'order',
        type: 'tuple',
        components: [
          {
            name: 'makerToken',
            type: 'address',
          },
          {
            name: 'takerToken',
            type: 'address',
          },
          {
            name: 'makerAmount',
            type: 'uint128',
          },
          {
            name: 'takerAmount',
            type: 'uint128',
          },
          {
            name: 'takerTokenFeeAmount',
            type: 'uint128',
          },
          {
            name: 'maker',
            type: 'address',
          },
          {
            name: 'taker',
            type: 'address',
          },
          {
            name: 'sender',
            type: 'address',
          },
          {
            name: 'feeRecipient',
            type: 'address',
          },
          {
            name: 'pool',
            type: 'bytes32',
          },
          {
            name: 'expiry',
            type: 'uint64',
          },
          {
            name: 'salt',
            type: 'uint256',
          },
        ],
      },
      {
        name: 'signature',
        type: 'tuple',
        components: [
          {
            name: 'signatureType',
            type: 'uint8',
          },
          {
            name: 'v',
            type: 'uint8',
          },
          {
            name: 'r',
            type: 'bytes32',
          },
          {
            name: 's',
            type: 'bytes32',
          },
        ],
      },
      {
        name: 'takerTokenFillAmount',
        type: 'uint128',
      },
    ],
    name: 'fillLimitOrder',
    outputs: [
      {
        name: 'takerTokenFilledAmount',
        type: 'uint128',
      },
      {
        name: 'makerTokenFilledAmount',
        type: 'uint128',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'order',
        type: 'tuple',
        components: [
          {
            name: 'makerToken',
            type: 'address',
          },
          {
            name: 'takerToken',
            type: 'address',
          },
          {
            name: 'makerAmount',
            type: 'uint128',
          },
          {
            name: 'takerAmount',
            type: 'uint128',
          },
          {
            name: 'takerTokenFeeAmount',
            type: 'uint128',
          },
          {
            name: 'maker',
            type: 'address',
          },
          {
            name: 'taker',
            type: 'address',
          },
          {
            name: 'sender',
            type: 'address',
          },
          {
            name: 'feeRecipient',
            type: 'address',
          },
          {
            name: 'pool',
            type: 'bytes32',
          },
          {
            name: 'expiry',
            type: 'uint64',
          },
          {
            name: 'salt',
            type: 'uint256',
          },
        ],
      },
      {
        name: 'signature',
        type: 'tuple',
        components: [
          {
            name: 'signatureType',
            type: 'uint8',
          },
          {
            name: 'v',
            type: 'uint8',
          },
          {
            name: 'r',
            type: 'bytes32',
          },
          {
            name: 's',
            type: 'bytes32',
          },
        ],
      },
      {
        name: 'takerTokenFillAmount',
        type: 'uint128',
      },
    ],
    name: 'fillOrKillLimitOrder',
    outputs: [
      {
        name: 'makerTokenFilledAmount',
        type: 'uint128',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'order',
        type: 'tuple',
        components: [
          {
            name: 'makerToken',
            type: 'address',
          },
          {
            name: 'takerToken',
            type: 'address',
          },
          {
            name: 'makerAmount',
            type: 'uint128',
          },
          {
            name: 'takerAmount',
            type: 'uint128',
          },
          {
            name: 'maker',
            type: 'address',
          },
          {
            name: 'taker',
            type: 'address',
          },
          {
            name: 'txOrigin',
            type: 'address',
          },
          {
            name: 'pool',
            type: 'bytes32',
          },
          {
            name: 'expiry',
            type: 'uint64',
          },
          {
            name: 'salt',
            type: 'uint256',
          },
        ],
      },
      {
        name: 'signature',
        type: 'tuple',
        components: [
          {
            name: 'signatureType',
            type: 'uint8',
          },
          {
            name: 'v',
            type: 'uint8',
          },
          {
            name: 'r',
            type: 'bytes32',
          },
          {
            name: 's',
            type: 'bytes32',
          },
        ],
      },
      {
        name: 'takerTokenFillAmount',
        type: 'uint128',
      },
    ],
    name: 'fillOrKillRfqOrder',
    outputs: [
      {
        name: 'makerTokenFilledAmount',
        type: 'uint128',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'order',
        type: 'tuple',
        components: [
          {
            name: 'makerToken',
            type: 'address',
          },
          {
            name: 'takerToken',
            type: 'address',
          },
          {
            name: 'makerAmount',
            type: 'uint128',
          },
          {
            name: 'takerAmount',
            type: 'uint128',
          },
          {
            name: 'maker',
            type: 'address',
          },
          {
            name: 'taker',
            type: 'address',
          },
          {
            name: 'txOrigin',
            type: 'address',
          },
          {
            name: 'pool',
            type: 'bytes32',
          },
          {
            name: 'expiry',
            type: 'uint64',
          },
          {
            name: 'salt',
            type: 'uint256',
          },
        ],
      },
      {
        name: 'signature',
        type: 'tuple',
        components: [
          {
            name: 'signatureType',
            type: 'uint8',
          },
          {
            name: 'v',
            type: 'uint8',
          },
          {
            name: 'r',
            type: 'bytes32',
          },
          {
            name: 's',
            type: 'bytes32',
          },
        ],
      },
      {
        name: 'takerTokenFillAmount',
        type: 'uint128',
      },
    ],
    name: 'fillRfqOrder',
    outputs: [
      {
        name: 'takerTokenFilledAmount',
        type: 'uint128',
      },
      {
        name: 'makerTokenFilledAmount',
        type: 'uint128',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getDecimalPrice',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'orderHash',
        type: 'bytes32',
      },
    ],
    name: 'getFilledOrder',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'order',
        type: 'tuple',
        components: [
          {
            name: 'makerToken',
            type: 'address',
          },
          {
            name: 'takerToken',
            type: 'address',
          },
          {
            name: 'makerAmount',
            type: 'uint128',
          },
          {
            name: 'takerAmount',
            type: 'uint128',
          },
          {
            name: 'takerTokenFeeAmount',
            type: 'uint128',
          },
          {
            name: 'maker',
            type: 'address',
          },
          {
            name: 'taker',
            type: 'address',
          },
          {
            name: 'sender',
            type: 'address',
          },
          {
            name: 'feeRecipient',
            type: 'address',
          },
          {
            name: 'pool',
            type: 'bytes32',
          },
          {
            name: 'expiry',
            type: 'uint64',
          },
          {
            name: 'salt',
            type: 'uint256',
          },
        ],
      },
    ],
    name: 'getLimitOrderHash',
    outputs: [
      {
        name: 'orderHash',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'order',
        type: 'tuple',
        components: [
          {
            name: 'makerToken',
            type: 'address',
          },
          {
            name: 'takerToken',
            type: 'address',
          },
          {
            name: 'makerAmount',
            type: 'uint128',
          },
          {
            name: 'takerAmount',
            type: 'uint128',
          },
          {
            name: 'takerTokenFeeAmount',
            type: 'uint128',
          },
          {
            name: 'maker',
            type: 'address',
          },
          {
            name: 'taker',
            type: 'address',
          },
          {
            name: 'sender',
            type: 'address',
          },
          {
            name: 'feeRecipient',
            type: 'address',
          },
          {
            name: 'pool',
            type: 'bytes32',
          },
          {
            name: 'expiry',
            type: 'uint64',
          },
          {
            name: 'salt',
            type: 'uint256',
          },
        ],
      },
    ],
    name: 'getLimitOrderInfo',
    outputs: [
      {
        name: 'orderInfo',
        type: 'tuple',
        components: [
          {
            name: 'orderHash',
            type: 'bytes32',
          },
          {
            name: 'status',
            type: 'uint8',
          },
          {
            name: 'makerTokenFilledAmount',
            type: 'uint128',
          },
          {
            name: 'takerTokenFilledAmount',
            type: 'uint128',
          },
        ],
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'order',
        type: 'tuple',
        components: [
          {
            name: 'makerToken',
            type: 'address',
          },
          {
            name: 'takerToken',
            type: 'address',
          },
          {
            name: 'makerAmount',
            type: 'uint128',
          },
          {
            name: 'takerAmount',
            type: 'uint128',
          },
          {
            name: 'takerTokenFeeAmount',
            type: 'uint128',
          },
          {
            name: 'maker',
            type: 'address',
          },
          {
            name: 'taker',
            type: 'address',
          },
          {
            name: 'sender',
            type: 'address',
          },
          {
            name: 'feeRecipient',
            type: 'address',
          },
          {
            name: 'pool',
            type: 'bytes32',
          },
          {
            name: 'expiry',
            type: 'uint64',
          },
          {
            name: 'salt',
            type: 'uint256',
          },
        ],
      },
      {
        name: 'signature',
        type: 'tuple',
        components: [
          {
            name: 'signatureType',
            type: 'uint8',
          },
          {
            name: 'v',
            type: 'uint8',
          },
          {
            name: 'r',
            type: 'bytes32',
          },
          {
            name: 's',
            type: 'bytes32',
          },
        ],
      },
    ],
    name: 'getLimitOrderRelevantState',
    outputs: [
      {
        name: 'orderInfo',
        type: 'tuple',
        components: [
          {
            name: 'orderHash',
            type: 'bytes32',
          },
          {
            name: 'status',
            type: 'uint8',
          },
          {
            name: 'makerTokenFilledAmount',
            type: 'uint128',
          },
          {
            name: 'takerTokenFilledAmount',
            type: 'uint128',
          },
        ],
      },
      {
        name: 'actualFillableTakerTokenAmount',
        type: 'uint128',
      },
      {
        name: 'isSignatureValid',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'sellOrder',
        type: 'tuple',
        components: [
          {
            name: 'makerToken',
            type: 'address',
          },
          {
            name: 'takerToken',
            type: 'address',
          },
          {
            name: 'makerAmount',
            type: 'uint128',
          },
          {
            name: 'takerAmount',
            type: 'uint128',
          },
          {
            name: 'takerTokenFeeAmount',
            type: 'uint128',
          },
          {
            name: 'maker',
            type: 'address',
          },
          {
            name: 'taker',
            type: 'address',
          },
          {
            name: 'sender',
            type: 'address',
          },
          {
            name: 'feeRecipient',
            type: 'address',
          },
          {
            name: 'pool',
            type: 'bytes32',
          },
          {
            name: 'expiry',
            type: 'uint64',
          },
          {
            name: 'salt',
            type: 'uint256',
          },
        ],
      },
      {
        name: 'buyOrder',
        type: 'tuple',
        components: [
          {
            name: 'makerToken',
            type: 'address',
          },
          {
            name: 'takerToken',
            type: 'address',
          },
          {
            name: 'makerAmount',
            type: 'uint128',
          },
          {
            name: 'takerAmount',
            type: 'uint128',
          },
          {
            name: 'takerTokenFeeAmount',
            type: 'uint128',
          },
          {
            name: 'maker',
            type: 'address',
          },
          {
            name: 'taker',
            type: 'address',
          },
          {
            name: 'sender',
            type: 'address',
          },
          {
            name: 'feeRecipient',
            type: 'address',
          },
          {
            name: 'pool',
            type: 'bytes32',
          },
          {
            name: 'expiry',
            type: 'uint64',
          },
          {
            name: 'salt',
            type: 'uint256',
          },
        ],
      },
      {
        name: 'price',
        type: 'uint256',
      },
      {
        name: 'sellType',
        type: 'uint8',
      },
      {
        name: 'buyType',
        type: 'uint8',
      },
    ],
    name: 'getMatchOrderResult',
    outputs: [
      {
        name: 'matchedFillResults',
        type: 'tuple',
        components: [
          {
            name: 'makerAmountFinal',
            type: 'uint256',
          },
          {
            name: 'takerAmountFinal',
            type: 'uint256',
          },
          {
            name: 'sellFeePaid',
            type: 'uint256',
          },
          {
            name: 'buyFeePaid',
            type: 'uint256',
          },
          {
            name: 'returnSellAmount',
            type: 'uint256',
          },
          {
            name: 'returnBuyAmount',
            type: 'uint256',
          },
        ],
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'mtx',
        type: 'tuple',
        components: [
          {
            name: 'signer',
            type: 'address',
          },
          {
            name: 'sender',
            type: 'address',
          },
          {
            name: 'minGasPrice',
            type: 'uint256',
          },
          {
            name: 'maxGasPrice',
            type: 'uint256',
          },
          {
            name: 'expirationTimeSeconds',
            type: 'uint256',
          },
          {
            name: 'salt',
            type: 'uint256',
          },
          {
            name: 'callData',
            type: 'bytes',
          },
          {
            name: 'value',
            type: 'uint256',
          },
          {
            name: 'feeToken',
            type: 'address',
          },
          {
            name: 'feeAmount',
            type: 'uint256',
          },
        ],
      },
    ],
    name: 'getMetaTransactionExecutedBlock',
    outputs: [
      {
        name: 'blockNumber',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'mtx',
        type: 'tuple',
        components: [
          {
            name: 'signer',
            type: 'address',
          },
          {
            name: 'sender',
            type: 'address',
          },
          {
            name: 'minGasPrice',
            type: 'uint256',
          },
          {
            name: 'maxGasPrice',
            type: 'uint256',
          },
          {
            name: 'expirationTimeSeconds',
            type: 'uint256',
          },
          {
            name: 'salt',
            type: 'uint256',
          },
          {
            name: 'callData',
            type: 'bytes',
          },
          {
            name: 'value',
            type: 'uint256',
          },
          {
            name: 'feeToken',
            type: 'address',
          },
          {
            name: 'feeAmount',
            type: 'uint256',
          },
        ],
      },
    ],
    name: 'getMetaTransactionHash',
    outputs: [
      {
        name: 'mtxHash',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'mtxHash',
        type: 'bytes32',
      },
    ],
    name: 'getMetaTransactionHashExecutedBlock',
    outputs: [
      {
        name: 'blockNumber',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'orderHash',
        type: 'bytes32',
      },
    ],
    name: 'getOrderHashInfo',
    outputs: [
      {
        name: 'filled',
        type: 'uint256',
      },
      {
        name: 'feeLock',
        type: 'uint256',
      },
      {
        name: 'locked',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'order',
        type: 'tuple',
        components: [
          {
            name: 'makerToken',
            type: 'address',
          },
          {
            name: 'takerToken',
            type: 'address',
          },
          {
            name: 'makerAmount',
            type: 'uint128',
          },
          {
            name: 'takerAmount',
            type: 'uint128',
          },
          {
            name: 'takerTokenFeeAmount',
            type: 'uint128',
          },
          {
            name: 'maker',
            type: 'address',
          },
          {
            name: 'taker',
            type: 'address',
          },
          {
            name: 'sender',
            type: 'address',
          },
          {
            name: 'feeRecipient',
            type: 'address',
          },
          {
            name: 'pool',
            type: 'bytes32',
          },
          {
            name: 'expiry',
            type: 'uint64',
          },
          {
            name: 'salt',
            type: 'uint256',
          },
        ],
      },
      {
        name: 'amount',
        type: 'uint128',
      },
    ],
    name: 'getOrderInfo',
    outputs: [
      {
        name: 'orderInfo',
        type: 'tuple',
        components: [
          {
            name: 'orderHash',
            type: 'bytes32',
          },
          {
            name: 'status',
            type: 'uint8',
          },
          {
            name: 'makerTokenFilledAmount',
            type: 'uint128',
          },
          {
            name: 'takerTokenFilledAmount',
            type: 'uint128',
          },
        ],
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'orderHash',
        type: 'bytes32',
      },
    ],
    name: 'getOrderLocked',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getProtocolFeeMultiplier',
    outputs: [
      {
        name: 'multiplier',
        type: 'uint32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getQuoteSigner',
    outputs: [
      {
        name: 'signer',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'order',
        type: 'tuple',
        components: [
          {
            name: 'makerToken',
            type: 'address',
          },
          {
            name: 'takerToken',
            type: 'address',
          },
          {
            name: 'makerAmount',
            type: 'uint128',
          },
          {
            name: 'takerAmount',
            type: 'uint128',
          },
          {
            name: 'maker',
            type: 'address',
          },
          {
            name: 'taker',
            type: 'address',
          },
          {
            name: 'txOrigin',
            type: 'address',
          },
          {
            name: 'pool',
            type: 'bytes32',
          },
          {
            name: 'expiry',
            type: 'uint64',
          },
          {
            name: 'salt',
            type: 'uint256',
          },
        ],
      },
    ],
    name: 'getRfqOrderHash',
    outputs: [
      {
        name: 'orderHash',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'order',
        type: 'tuple',
        components: [
          {
            name: 'makerToken',
            type: 'address',
          },
          {
            name: 'takerToken',
            type: 'address',
          },
          {
            name: 'makerAmount',
            type: 'uint128',
          },
          {
            name: 'takerAmount',
            type: 'uint128',
          },
          {
            name: 'maker',
            type: 'address',
          },
          {
            name: 'taker',
            type: 'address',
          },
          {
            name: 'txOrigin',
            type: 'address',
          },
          {
            name: 'pool',
            type: 'bytes32',
          },
          {
            name: 'expiry',
            type: 'uint64',
          },
          {
            name: 'salt',
            type: 'uint256',
          },
        ],
      },
    ],
    name: 'getRfqOrderInfo',
    outputs: [
      {
        name: 'orderInfo',
        type: 'tuple',
        components: [
          {
            name: 'orderHash',
            type: 'bytes32',
          },
          {
            name: 'status',
            type: 'uint8',
          },
          {
            name: 'makerTokenFilledAmount',
            type: 'uint128',
          },
          {
            name: 'takerTokenFilledAmount',
            type: 'uint128',
          },
        ],
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'order',
        type: 'tuple',
        components: [
          {
            name: 'makerToken',
            type: 'address',
          },
          {
            name: 'takerToken',
            type: 'address',
          },
          {
            name: 'makerAmount',
            type: 'uint128',
          },
          {
            name: 'takerAmount',
            type: 'uint128',
          },
          {
            name: 'maker',
            type: 'address',
          },
          {
            name: 'taker',
            type: 'address',
          },
          {
            name: 'txOrigin',
            type: 'address',
          },
          {
            name: 'pool',
            type: 'bytes32',
          },
          {
            name: 'expiry',
            type: 'uint64',
          },
          {
            name: 'salt',
            type: 'uint256',
          },
        ],
      },
      {
        name: 'signature',
        type: 'tuple',
        components: [
          {
            name: 'signatureType',
            type: 'uint8',
          },
          {
            name: 'v',
            type: 'uint8',
          },
          {
            name: 'r',
            type: 'bytes32',
          },
          {
            name: 's',
            type: 'bytes32',
          },
        ],
      },
    ],
    name: 'getRfqOrderRelevantState',
    outputs: [
      {
        name: 'orderInfo',
        type: 'tuple',
        components: [
          {
            name: 'orderHash',
            type: 'bytes32',
          },
          {
            name: 'status',
            type: 'uint8',
          },
          {
            name: 'makerTokenFilledAmount',
            type: 'uint128',
          },
          {
            name: 'takerTokenFilledAmount',
            type: 'uint128',
          },
        ],
      },
      {
        name: 'actualFillableTakerTokenAmount',
        type: 'uint128',
      },
      {
        name: 'isSignatureValid',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'selector',
        type: 'bytes4',
      },
      {
        name: 'idx',
        type: 'uint256',
      },
    ],
    name: 'getRollbackEntryAtIndex',
    outputs: [
      {
        name: 'impl',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'selector',
        type: 'bytes4',
      },
    ],
    name: 'getRollbackLength',
    outputs: [
      {
        name: 'rollbackLength',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getTransformWallet',
    outputs: [
      {
        name: 'wallet',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getTransformerDeployer',
    outputs: [
      {
        name: 'deployer',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getWhitelist',
    outputs: [
      {
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'maker',
        type: 'address',
      },
      {
        name: 'signer',
        type: 'address',
      },
    ],
    name: 'isValidOrderSigner',
    outputs: [
      {
        name: 'isAllowed',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'leftOrder',
        type: 'tuple',
        components: [
          {
            name: 'makerToken',
            type: 'address',
          },
          {
            name: 'takerToken',
            type: 'address',
          },
          {
            name: 'makerAmount',
            type: 'uint128',
          },
          {
            name: 'takerAmount',
            type: 'uint128',
          },
          {
            name: 'takerTokenFeeAmount',
            type: 'uint128',
          },
          {
            name: 'maker',
            type: 'address',
          },
          {
            name: 'taker',
            type: 'address',
          },
          {
            name: 'sender',
            type: 'address',
          },
          {
            name: 'feeRecipient',
            type: 'address',
          },
          {
            name: 'pool',
            type: 'bytes32',
          },
          {
            name: 'expiry',
            type: 'uint64',
          },
          {
            name: 'salt',
            type: 'uint256',
          },
        ],
      },
      {
        name: 'rightOrder',
        type: 'tuple',
        components: [
          {
            name: 'makerToken',
            type: 'address',
          },
          {
            name: 'takerToken',
            type: 'address',
          },
          {
            name: 'makerAmount',
            type: 'uint128',
          },
          {
            name: 'takerAmount',
            type: 'uint128',
          },
          {
            name: 'takerTokenFeeAmount',
            type: 'uint128',
          },
          {
            name: 'maker',
            type: 'address',
          },
          {
            name: 'taker',
            type: 'address',
          },
          {
            name: 'sender',
            type: 'address',
          },
          {
            name: 'feeRecipient',
            type: 'address',
          },
          {
            name: 'pool',
            type: 'bytes32',
          },
          {
            name: 'expiry',
            type: 'uint64',
          },
          {
            name: 'salt',
            type: 'uint256',
          },
        ],
      },
      {
        name: 'leftSignature',
        type: 'tuple',
        components: [
          {
            name: 'signatureType',
            type: 'uint8',
          },
          {
            name: 'v',
            type: 'uint8',
          },
          {
            name: 'r',
            type: 'bytes32',
          },
          {
            name: 's',
            type: 'bytes32',
          },
        ],
      },
      {
        name: 'rightSignature',
        type: 'tuple',
        components: [
          {
            name: 'signatureType',
            type: 'uint8',
          },
          {
            name: 'v',
            type: 'uint8',
          },
          {
            name: 'r',
            type: 'bytes32',
          },
          {
            name: 's',
            type: 'bytes32',
          },
        ],
      },
      {
        name: 'price',
        type: 'uint256',
      },
      {
        name: 'sellType',
        type: 'uint8',
      },
      {
        name: 'buyType',
        type: 'uint8',
      },
    ],
    name: 'matchOrders',
    outputs: [
      {
        name: 'matchedFillResults',
        type: 'tuple',
        components: [
          {
            name: 'makerAmountFinal',
            type: 'uint256',
          },
          {
            name: 'takerAmountFinal',
            type: 'uint256',
          },
          {
            name: 'sellFeePaid',
            type: 'uint256',
          },
          {
            name: 'buyFeePaid',
            type: 'uint256',
          },
          {
            name: 'returnSellAmount',
            type: 'uint256',
          },
          {
            name: 'returnBuyAmount',
            type: 'uint256',
          },
        ],
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'target',
        type: 'address',
      },
      {
        name: 'data',
        type: 'bytes',
      },
      {
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'migrate',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'fillData',
        type: 'tuple',
        components: [
          {
            name: 'tokens',
            type: 'address[]',
          },
          {
            name: 'sellAmount',
            type: 'uint256',
          },
          {
            name: 'calls',
            type: 'tuple[]',
            components: [
              {
                name: 'selector',
                type: 'bytes4',
              },
              {
                name: 'data',
                type: 'bytes',
              },
            ],
          },
        ],
      },
      {
        name: 'minBuyAmount',
        type: 'uint256',
      },
    ],
    name: 'multiHopFill',
    outputs: [
      {
        name: 'outputTokenAmount',
        type: 'uint256',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        name: 'ownerAddress',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'signer',
        type: 'address',
      },
      {
        name: 'allowed',
        type: 'bool',
      },
    ],
    name: 'registerAllowedOrderSigner',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'origins',
        type: 'address[]',
      },
      {
        name: 'allowed',
        type: 'bool',
      },
    ],
    name: 'registerAllowedRfqOrigins',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'selector',
        type: 'bytes4',
      },
      {
        name: 'targetImpl',
        type: 'address',
      },
    ],
    name: 'rollback',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'inputToken',
        type: 'address',
      },
      {
        name: 'outputToken',
        type: 'address',
      },
      {
        name: 'provider',
        type: 'address',
      },
      {
        name: 'recipient',
        type: 'address',
      },
      {
        name: 'sellAmount',
        type: 'uint256',
      },
      {
        name: 'minBuyAmount',
        type: 'uint256',
      },
      {
        name: 'auxiliaryData',
        type: 'bytes',
      },
    ],
    name: 'sellToLiquidityProvider',
    outputs: [
      {
        name: 'boughtAmount',
        type: 'uint256',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'tokens',
        type: 'address[]',
      },
      {
        name: 'sellAmount',
        type: 'uint256',
      },
      {
        name: 'minBuyAmount',
        type: 'uint256',
      },
      {
        name: 'fork',
        type: 'uint8',
      },
    ],
    name: 'sellToPancakeSwap',
    outputs: [
      {
        name: 'buyAmount',
        type: 'uint256',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'tokens',
        type: 'address[]',
      },
      {
        name: 'sellAmount',
        type: 'uint256',
      },
      {
        name: 'minBuyAmount',
        type: 'uint256',
      },
      {
        name: 'isSushi',
        type: 'bool',
      },
    ],
    name: 'sellToUniswap',
    outputs: [
      {
        name: 'buyAmount',
        type: 'uint256',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        name: '_decimal',
        type: 'uint256',
      },
    ],
    name: 'setDecimalPrice',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'quoteSigner',
        type: 'address',
      },
    ],
    name: 'setQuoteSigner',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'transformerDeployer',
        type: 'address',
      },
    ],
    name: 'setTransformerDeployer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        name: '_whitelist',
        type: 'address',
      },
    ],
    name: 'setWhitelist',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'poolIds',
        type: 'bytes32[]',
      },
    ],
    name: 'transferProtocolFeesForPools',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'inputToken',
        type: 'address',
      },
      {
        name: 'outputToken',
        type: 'address',
      },
      {
        name: 'inputTokenAmount',
        type: 'uint256',
      },
      {
        name: 'minOutputTokenAmount',
        type: 'uint256',
      },
      {
        name: 'transformations',
        type: 'tuple[]',
        components: [
          {
            name: 'deploymentNonce',
            type: 'uint32',
          },
          {
            name: 'data',
            type: 'bytes',
          },
        ],
      },
    ],
    name: 'transformERC20',
    outputs: [
      {
        name: 'outputTokenAmount',
        type: 'uint256',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
];
