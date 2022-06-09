import { LatestBlockCoin } from 'src/modules/latest-block/latest-block.const';
import { LatestBlockService } from 'src/modules/latest-block/latest-block.service';
import { BSC_BLOCK_TIME, BSC_STEP_BLOCK } from 'src/modules/orders/orders.const';
import { sleep } from 'src/shares/helpers/utils';

export async function crawlBscEvents(
  // eslint-disable-next-line
  web3: any,
  latestBlockService: LatestBlockService,
  // eslint-disable-next-line
  contract: any,
  eventName: string,
  callback: (event) => void,
): Promise<void> {
  let cursor = 0;
  const latestBlock = await latestBlockService.getLatestBlock(LatestBlockCoin.bsc, eventName);
  if (latestBlock.block) cursor = Number(latestBlock.block);

  while (true) {
    const to = Math.min(cursor + BSC_STEP_BLOCK, await web3.eth.getBlockNumber());
    const params = { fromBlock: cursor + 1, toBlock: to };
    const events = await contract.getPastEvents(eventName, params);

    for (const event of events) {
      callback(event);
    }
    cursor = to;
    await latestBlockService.saveLatestBlock(LatestBlockCoin.bsc, eventName, to.toString());
    await sleep(BSC_BLOCK_TIME);
  }
}
