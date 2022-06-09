import { BigNumber } from '@0x/utils';
import { PairCoin } from 'src/modules/trades/dto/pair-coin.dto';
import { getOfferPrice, isBuyOffer } from 'src/modules/orders/offer.helper';
import { StellarAssetTypeNumber } from 'src/shares/constants/constant';
import { StellarOffer } from 'src/shares/interfaces/stellar-offer';

describe('Stellar Offers', () => {
  let pair: PairCoin;
  beforeEach(async () => {
    const issuer = 'GAXXMQMTDUQ4YEPXJMKFBGN3GETPJNEXEUHFCQJKGJDVI3XQCNBU3OZI';

    pair = new PairCoin();
    pair.pairs_id = 1;
    pair.base_symbol = 'vVND';
    pair.base_type = StellarAssetTypeNumber.CreditAlphanum4;
    pair.base_stellar_issuer = issuer;
    pair.quote_symbol = 'vUSD';
    pair.quote_type = StellarAssetTypeNumber.CreditAlphanum4;
    pair.quote_stellar_issuer = issuer;
  });

  it('check offer side 1', async () => {
    const stellarOffer = {
      id: '1195735',
      paging_token: '1195735',
      seller: 'GCTL5ANINTLJXMSGEU7AVHP2JPIPKFIN7IQCKWCKGD4AZSKONC3O3FNL',
      selling: {
        asset_type: 'credit_alphanum4',
        asset_code: 'vUSD',
        asset_issuer: 'GAXXMQMTDUQ4YEPXJMKFBGN3GETPJNEXEUHFCQJKGJDVI3XQCNBU3OZI',
      },
      buying: {
        asset_type: 'credit_alphanum4',
        asset_code: 'vVND',
        asset_issuer: 'GAXXMQMTDUQ4YEPXJMKFBGN3GETPJNEXEUHFCQJKGJDVI3XQCNBU3OZI',
      },
      amount: '1.0000000',
      price_r: {
        n: 23123,
        d: 1,
      },
      price: '23123.0000000',
      last_modified_ledger: 328467,
      last_modified_time: '2021-07-06T08:43:17Z',
    };

    const result = isBuyOffer(stellarOffer, [], '1195735', pair);
    expect(result).toBe(false);
  });

  it('check offer side 2', async () => {
    const stellarOffer = {
      id: '1198698',
      paging_token: '1198698',
      seller: 'GCTL5ANINTLJXMSGEU7AVHP2JPIPKFIN7IQCKWCKGD4AZSKONC3O3FNL',
      selling: {
        asset_type: 'credit_alphanum4',
        asset_code: 'vVND',
        asset_issuer: 'GAXXMQMTDUQ4YEPXJMKFBGN3GETPJNEXEUHFCQJKGJDVI3XQCNBU3OZI',
      },
      buying: {
        asset_type: 'credit_alphanum4',
        asset_code: 'vUSD',
        asset_issuer: 'GAXXMQMTDUQ4YEPXJMKFBGN3GETPJNEXEUHFCQJKGJDVI3XQCNBU3OZI',
      },
      amount: '23123.0000000',
      price_r: {
        n: 27,
        d: 625000,
      },
      price: '0.0000432',
      last_modified_ledger: 329230,
      last_modified_time: '2021-07-06T09:50:04Z',
    };

    const result = isBuyOffer(stellarOffer, [], '1198698', pair);
    expect(result).toBe(true);
  });

  it('check offer side 3', async () => {
    const stellarOffer = {
      type: 'https://stellar.org/horizon-errors/not_found',
      title: 'Resource Missing',
      status: 404,
    };

    const trades = [
      {
        id: '1414599018549249-0',
        paging_token: '1414599018549249-0',
        ledger_close_time: '2021-07-06T10:01:39Z',
        offer_id: '1198698',
        base_offer_id: '4613100617445937153',
        base_account: 'GBVOEXSDM52ECVZ7K7VMOWZUVC5CC242KTCMSA2JKPKPVJWUPX5DW76L',
        base_amount: '0.0000432',
        base_asset_type: 'credit_alphanum4',
        base_asset_code: 'vUSD',
        base_asset_issuer: 'GAXXMQMTDUQ4YEPXJMKFBGN3GETPJNEXEUHFCQJKGJDVI3XQCNBU3OZI',
        counter_offer_id: '1198698',
        counter_account: 'GCTL5ANINTLJXMSGEU7AVHP2JPIPKFIN7IQCKWCKGD4AZSKONC3O3FNL',
        counter_amount: '1.0000000',
        counter_asset_type: 'credit_alphanum4',
        counter_asset_code: 'vVND',
        counter_asset_issuer: 'GAXXMQMTDUQ4YEPXJMKFBGN3GETPJNEXEUHFCQJKGJDVI3XQCNBU3OZI',
        base_is_seller: false,
        price: {
          n: 625000,
          d: 27,
        },
      },
      {
        id: '1414749342408705-0',
        paging_token: '1414749342408705-0',
        ledger_close_time: '2021-07-06T10:04:45Z',
        offer_id: '1198698',
        base_offer_id: '1199377',
        base_account: 'GBVOEXSDM52ECVZ7K7VMOWZUVC5CC242KTCMSA2JKPKPVJWUPX5DW76L',
        base_amount: '0.9988704',
        base_asset_type: 'credit_alphanum4',
        base_asset_code: 'vUSD',
        base_asset_issuer: 'GAXXMQMTDUQ4YEPXJMKFBGN3GETPJNEXEUHFCQJKGJDVI3XQCNBU3OZI',
        counter_offer_id: '1198698',
        counter_account: 'GCTL5ANINTLJXMSGEU7AVHP2JPIPKFIN7IQCKWCKGD4AZSKONC3O3FNL',
        counter_amount: '23122.0000000',
        counter_asset_type: 'credit_alphanum4',
        counter_asset_code: 'vVND',
        counter_asset_issuer: 'GAXXMQMTDUQ4YEPXJMKFBGN3GETPJNEXEUHFCQJKGJDVI3XQCNBU3OZI',
        base_is_seller: false,
        price: {
          n: 625000,
          d: 27,
        },
      },
    ];

    const result = isBuyOffer((stellarOffer as unknown) as StellarOffer, trades, '1198698', pair);
    expect(result).toBe(true);
  });

  it('check offer side 4', async () => {
    const stellarOffer = {
      type: 'https://stellar.org/horizon-errors/not_found',
      title: 'Resource Missing',
      status: 404,
    };

    const trades = [
      {
        id: '1414749342408705-0',
        paging_token: '1414749342408705-0',
        ledger_close_time: '2021-07-06T10:04:45Z',
        offer_id: '1198698',
        base_offer_id: '1199377',
        base_account: 'GBVOEXSDM52ECVZ7K7VMOWZUVC5CC242KTCMSA2JKPKPVJWUPX5DW76L',
        base_amount: '0.9988704',
        base_asset_type: 'credit_alphanum4',
        base_asset_code: 'vUSD',
        base_asset_issuer: 'GAXXMQMTDUQ4YEPXJMKFBGN3GETPJNEXEUHFCQJKGJDVI3XQCNBU3OZI',
        counter_offer_id: '1198698',
        counter_account: 'GCTL5ANINTLJXMSGEU7AVHP2JPIPKFIN7IQCKWCKGD4AZSKONC3O3FNL',
        counter_amount: '23122.0000000',
        counter_asset_type: 'credit_alphanum4',
        counter_asset_code: 'vVND',
        counter_asset_issuer: 'GAXXMQMTDUQ4YEPXJMKFBGN3GETPJNEXEUHFCQJKGJDVI3XQCNBU3OZI',
        base_is_seller: false,
        price: {
          n: 625000,
          d: 27,
        },
      },
    ];

    const result = isBuyOffer((stellarOffer as unknown) as StellarOffer, trades, '1199377', pair);
    expect(result).toBe(false);
  });

  it('check offer price 1', async () => {
    const offer = {
      id: '1211421',
      paging_token: '1211421',
      seller: 'GBVOEXSDM52ECVZ7K7VMOWZUVC5CC242KTCMSA2JKPKPVJWUPX5DW76L',
      selling: {
        asset_type: 'credit_alphanum4',
        asset_code: 'vUSD',
        asset_issuer: 'GAXXMQMTDUQ4YEPXJMKFBGN3GETPJNEXEUHFCQJKGJDVI3XQCNBU3OZI',
      },
      buying: {
        asset_type: 'credit_alphanum4',
        asset_code: 'vVND',
        asset_issuer: 'GAXXMQMTDUQ4YEPXJMKFBGN3GETPJNEXEUHFCQJKGJDVI3XQCNBU3OZI',
      },
      amount: '1.0000000',
      price_r: {
        n: 23123,
        d: 1,
      },
      price: '23123.0000000',
      last_modified_ledger: 332464,
      last_modified_time: '2021-07-06T14:32:58Z',
    };

    const trades = [];

    const result = getOfferPrice(offer, trades, '1211421', pair);
    expect(new BigNumber(result).eq(23123)).toBe(true);
  });

  it('check offer price 2', async () => {
    const offer = {
      type: 'https://stellar.org/horizon-errors/not_found',
      title: 'Resource Missing',
      status: 404,
    };

    const trades = [
      {
        id: '1428991453974529-0',
        paging_token: '1428991453974529-0',
        ledger_close_time: '2021-07-06T14:54:41Z',
        offer_id: '1211421',
        base_offer_id: '1211421',
        base_account: 'GBVOEXSDM52ECVZ7K7VMOWZUVC5CC242KTCMSA2JKPKPVJWUPX5DW76L',
        base_amount: '1.0000000',
        base_asset_type: 'credit_alphanum4',
        base_asset_code: 'vUSD',
        base_asset_issuer: 'GAXXMQMTDUQ4YEPXJMKFBGN3GETPJNEXEUHFCQJKGJDVI3XQCNBU3OZI',
        counter_offer_id: '4613115009881362433',
        counter_account: 'GCTL5ANINTLJXMSGEU7AVHP2JPIPKFIN7IQCKWCKGD4AZSKONC3O3FNL',
        counter_amount: '23123.0000000',
        counter_asset_type: 'credit_alphanum4',
        counter_asset_code: 'vVND',
        counter_asset_issuer: 'GAXXMQMTDUQ4YEPXJMKFBGN3GETPJNEXEUHFCQJKGJDVI3XQCNBU3OZI',
        base_is_seller: true,
        price: {
          n: 23123,
          d: 1,
        },
      },
    ];

    const result = getOfferPrice((offer as unknown) as StellarOffer, trades, '1211421', pair);
    expect(new BigNumber(result).eq(23123)).toBe(true);
  });
});
