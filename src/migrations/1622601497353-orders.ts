import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class orders1622601497353 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'orders',
        columns: [
          // common columns
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
            unsigned: true,
          },
          {
            name: 'user_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'pair_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'tinyint',
            isNullable: false,
            comment: '1-limit, 2-market',
            default: '1',
          },
          {
            name: 'side',
            type: 'tinyint',
            isNullable: false,
            default: '1',
            comment: '1 - buy, 2 - sell',
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 40,
            scale: 8,
            isNullable: false,
          },
          {
            name: 'average',
            type: 'decimal',
            precision: 40,
            scale: 8,
            isNullable: true,
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 40,
            scale: 8,
            isNullable: true,
          },
          {
            name: 'filled_amount',
            type: 'decimal',
            default: '0',
            precision: 40,
            scale: 8,
            isNullable: false,
            comment: 'include fee',
          },
          {
            name: 'remaining_amount',
            type: 'decimal',
            precision: 40,
            scale: 8,
            isNullable: false,
            comment: 'exclude fee',
          },
          {
            name: 'total',
            type: 'decimal',
            precision: 40,
            scale: 8,
            isNullable: true,
          },
          {
            name: 'status',
            type: 'tinyint',
            isNullable: false,
            comment: '-1-cancel, 0-pending, 1-fillable, 2-filling, 3-fullfill',
          },
          {
            name: 'method',
            type: 'tinyint',
            isNullable: false,
            comment: '1-stellar-ob, 2-bsc-ob, 4-pool, 3-combined-orderbook, 7-all',
          },
          {
            name: 'fee_rate',
            type: 'decimal',
            precision: 40,
            scale: 8,
            isNullable: false,
          },
          // end common columns

          // bsc order columns
          {
            name: 'maker_token',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'taker_token',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'maker_amounts',
            type: 'decimal',
            precision: 40,
            scale: 8,
            isNullable: true,
          },
          {
            name: 'taker_amounts',
            type: 'decimal',
            precision: 40,
            scale: 8,
            isNullable: true,
          },
          {
            name: 'sender',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'maker',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'taker',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'taker_token_fee_amounts',
            type: 'decimal',
            precision: 40,
            scale: 8,
            isNullable: true,
          },
          {
            name: 'fee_recipient',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'signature',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'salt',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'order_hash',
            type: 'varchar',
            isNullable: true,
          },
          // end bsc order columns

          // stellar order columns
          {
            name: 'stellar_id',
            type: 'varchar',
            isNullable: true,
            isUnique: true,
          },
          // end stellar order columns

          // pool order columns
          {
            name: 'pool_id',
            type: 'varchar',
            isNullable: true,
          },
          // end pool order columns

          {
            name: 'expiry',
            type: 'int unsigned',
            isNullable: true,
          },

          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );
    await queryRunner.createIndices('orders', [
      new TableIndex({
        columnNames: ['user_id'],
        isUnique: false,
      }),
      new TableIndex({
        columnNames: ['user_id', 'status'],
        isUnique: false,
      }),
      new TableIndex({
        columnNames: ['maker'],
        isUnique: false,
      }),
      new TableIndex({
        columnNames: ['pair_id'],
        isUnique: false,
      }),
      new TableIndex({
        columnNames: ['status'],
        isUnique: false,
      }),
      new TableIndex({
        columnNames: ['order_hash'],
        isUnique: false,
      }),
      new TableIndex({
        columnNames: ['stellar_id'],
        isUnique: false,
      }),
      new TableIndex({
        columnNames: ['pool_id'],
        isUnique: false,
      }),
      new TableIndex({
        columnNames: ['created_at'],
        isUnique: false,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('orders');
  }
}
