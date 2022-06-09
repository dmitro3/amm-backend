import { Contract } from 'ethers';
import { provider } from 'src/configs/provider.config';
import { erc20ABI } from 'src/shares/contracts/abi/erc20.abi';
import { divMod } from 'src/shares/helpers/utils';
import { BigNumber } from '@0x/utils';

export class Erc20Contract {
  public erc20;

  public constructor(erc20Address: string) {
    this.erc20 = new Contract(erc20Address, erc20ABI, provider);
  }

  async getBalance(address: string): Promise<string> {
    try {
      const balance = await this.erc20.balanceOf(address);
      return balance.toString();
    } catch (e) {
      return '0';
    }
  }

  async getDecimal(): Promise<string> {
    try {
      const decimal = await this.erc20.decimals();
      return decimal.toString();
    } catch (e) {
      return '0';
    }
  }

  async getBalanceWithoutDecimal(address: string): Promise<string> {
    const [balance, decimal] = await Promise.all([this.getBalance(address), this.getDecimal()]);
    return divMod(balance, new BigNumber(10).pow(decimal).toString()).toString();
  }
}
