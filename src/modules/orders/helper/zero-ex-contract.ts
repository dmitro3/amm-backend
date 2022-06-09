import { Contract } from 'ethers';
import { contractAddress } from 'src/modules/orders/orders.const';
import { zeroExABI } from 'src/modules/contracts/abi/zeroExABI';
import { provider } from 'src/configs/provider.config';

export class ZeroExContract {
  private static instance: ZeroExContract;
  private zeroEx;

  private constructor() {
    this.zeroEx = new Contract(contractAddress.exchangeProxy, zeroExABI, provider);
  }

  public static getInstance(): Contract {
    if (!ZeroExContract.instance) {
      ZeroExContract.instance = new ZeroExContract();
    }
    return ZeroExContract.instance.zeroEx;
  }
}
