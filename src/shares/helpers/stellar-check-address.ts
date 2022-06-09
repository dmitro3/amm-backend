import { Keypair, Server } from 'stellar-sdk';
import * as config from 'config';

export const getPublicKeyFromPrivateKey = (secret: string): string => {
  const keyPair = Keypair.fromSecret(secret);
  return keyPair.publicKey();
};

export const isStellarPublicKey = (address: string): boolean => {
  try {
    return !!Keypair.fromPublicKey(address);
  } catch (e) {
    return false;
  }
};

export const isStellarSecret = (secret: string): boolean => {
  try {
    return !!Keypair.fromSecret(secret);
  } catch (e) {
    return false;
  }
};

export const isStellarAccountActive = async (address: string): Promise<boolean> => {
  const server = new Server(config.get<string>('stellar_url'));
  const res = await server
    .loadAccount(address)
    .then(() => true)
    .catch(() => false);

  return res;
};

export default { getPublicKeyFromPrivateKey, isStellarPublicKey, isStellarSecret };
