import { Test, TestingModule } from '@nestjs/testing';
import { MatchOrdersService } from 'src/modules/contracts/match-order-features/match-orders.service';

describe('MatchOrdersService', () => {
  let service: MatchOrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MatchOrdersService],
    }).compile();

    service = module.get<MatchOrdersService>(MatchOrdersService);
  });

  it('should be defined and send transction', async () => {
    expect(service).toBeDefined();

    const sellOrder = {
      makerToken: '0x1132209e3b7fa51cd8cf45d901c391a9378c093e',
      takerToken: '0xe0a4e3137d479e422f6d8eb674e5f097dba8bbca',
      makerAmount: '3000000000000000000',
      takerAmount: '18000000000000000000',
      maker: '0xF54b3294616d39749732Ac74F234F46C9ABf29C4',
      taker: '0x0000000000000000000000000000000000000000',
      pool: '0xca2422b64f0717f2f3adedca30e3f43d07dc9e72b512c44decf28ecfc16399db',
      expiry: 1667555640,
      salt: '7786052018132498081261481228963745837969567503735854322082039835678852390336',
      chainId: 15,
      verifyingContract: '0xc0343abe0c7464455becb800bf9aa7f62ef60108',
      takerTokenFeeAmount: 0,
      sender: '0x0000000000000000000000000000000000000000',
      feeRecipient: '0x0000000000000000000000000000000000000000',
    };
    const buyOrder = {
      makerToken: '0xe0a4e3137d479e422f6d8eb674e5f097dba8bbca',
      takerToken: '0x1132209e3b7fa51cd8cf45d901c391a9378c093e',
      makerAmount: '26000000000000000000',
      takerAmount: '4000000000000000000',
      maker: '0xBdD34ca459A9Ff4B673aC398F856c0A24F408963',
      taker: '0x0000000000000000000000000000000000000000',
      pool: '0x3badeac4fcdb7893e95fa02f45c1f938b0de58dab0167c90c74defb614517b46',
      expiry: 1667555640,
      salt: '14194913943340909350317660713944052671740572851259979279415350843275363878940',
      chainId: 15,
      verifyingContract: '0xc0343abe0c7464455becb800bf9aa7f62ef60108',
      takerTokenFeeAmount: 0,
      sender: '0x0000000000000000000000000000000000000000',
      feeRecipient: '0x0000000000000000000000000000000000000000',
    };
    const sellSignature = {
      v: 28,
      r: '0x4302dbb610e03c36f9364b3da78c606d210109534a06d4e198f0a6e71f07a16c',
      s: '0x366035f3a211375e2cf90e37471d4d4e5666fbd70224cce683052b7758e8205f',
      signatureType: 2,
    };
    const buySignature = {
      v: 27,
      r: '0xc5e02293c7b3475f1c7aab3c45f27b6d2b5329ca6e5efe7f4bfe6f4ae6d241d3',
      s: '0x42349fd8c9a53c2f4e91bb21400159dd18474b527bd3e7a08ccdccb7e0692210',
      signatureType: 2,
    };
    const result = service.matchOrder(sellOrder, buyOrder, sellSignature, buySignature);
    console.log(result);
  });
});
