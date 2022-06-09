import { providers, Wallet } from 'ethers';
import { getConfig } from 'src/configs';

const rpcUrl = getConfig().get<string>('rpc_url');
const mnemonic = getConfig().get<string>('mnemonic');
const baseDerivationPath = getConfig().get<string>('base_derivation_path');

export const provider = new providers.JsonRpcProvider(rpcUrl);
export const matchOrderInstance = Wallet.fromMnemonic(mnemonic, baseDerivationPath).connect(provider);
