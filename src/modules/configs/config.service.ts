import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { assetDataUtils } from '@0x/order-utils';
import { In } from 'typeorm';
import * as _ from 'lodash';
import { ConfigTokenDTO } from 'src/modules/configs/config_token.dto';
import { ERC20ABI } from 'src/modules/orders/orders.const';
import { ConfigRepository } from 'src/models/repositories/config.repository';

@Injectable()
export class ConfigService {
  constructor(
    @InjectRepository(ConfigRepository, 'master')
    private readonly configRepo: ConfigRepository,
  ) {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getPairConfig(from: string, to: string): Promise<any> {
    return this.configRepo.findByIds([1]);
    if (!from || !to) {
      return 'please fill enough pair crypto name';
    }
    const fromToken = `${from}` + 'Token';
    const toToken = `${to}` + 'Token';
    const configEntitys = await this.configRepo.find({
      key: In([`chainId`, `exchangeAddress`, `${fromToken}`, `${toToken}`]),
    });
    const formatRes = _.keyBy(configEntitys, 'key');
    const configTokenDTO = new ConfigTokenDTO();
    configTokenDTO.chainId = formatRes['chainId']['value'];
    configTokenDTO.exchangeAddress = formatRes['exchangeAddress']['value'];
    configTokenDTO.fromAddress = formatRes[`${fromToken}`]['value'];
    configTokenDTO.toAddress = formatRes[`${toToken}`]['value'];
    configTokenDTO.fromAssetData = assetDataUtils.encodeERC20AssetData(configTokenDTO.fromAddress);
    configTokenDTO.toAssetData = assetDataUtils.encodeERC20AssetData(configTokenDTO.toAddress);
    configTokenDTO.fromABI = ERC20ABI;

    return configTokenDTO;
  }
}
