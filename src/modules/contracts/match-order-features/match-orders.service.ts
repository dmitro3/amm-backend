/* eslint-disable */
import { Injectable } from '@nestjs/common';
import { Contract } from 'ethers';
import { matchOrderInstance, provider } from 'src/configs/provider.config';
import { contractAddress, gasLimit } from 'src/modules/contracts/constants';
import { zeroExABI } from 'src/modules/contracts/abi/zeroExABI';
import { calculateProtocolFee } from 'src/shares/helpers/utils';

@Injectable()
export class MatchOrdersService {
  private zeroEx;
  private zeroExABI;
  private zeroAddress;
  constructor() {
    this.zeroAddress = contractAddress.exchangeProxy;
    this.zeroExABI = zeroExABI;
    this.zeroEx = new Contract(this.zeroAddress, this.zeroExABI, provider);
  }

  async matchOrder(sellOrder, buyOrder, sellSignature, buySignature) {
    return await this.zeroEx
      .connect(matchOrderInstance)
      .matchOrders(
        JSON.parse(JSON.stringify(sellOrder)),
        JSON.parse(JSON.stringify(buyOrder)),
        sellSignature,
        buySignature,
        { value: calculateProtocolFee([sellOrder, buyOrder]).toString(), gasLimit: gasLimit },
      );
  }
}
