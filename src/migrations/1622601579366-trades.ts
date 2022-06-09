import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class trades1622601579366 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'trades',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
            unsigned: true,
          },
          {
            name: 'pair_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'buy_user_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'sell_user_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'buy_order_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'sell_order_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 40,
            scale: 8,
            isNullable: false,
          },
          {
            name: 'filled_amount',
            type: 'decimal',
            precision: 40,
            scale: 8,
            isNullable: false,
          },
          {
            name: 'sell_fee',
            type: 'decimal',
            precision: 40,
            scale: 8,
            isNullable: false,
          },
          {
            name: 'buy_fee',
            type: 'decimal',
            precision: 40,
            scale: 8,
            isNullable: false,
          },
          {
            name: 'buyer_is_taker',
            type: 'boolean',
            isNullable: false,
          },
          {
            name: 'buy_address',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'sell_address',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'method',
            type: 'tinyint',
            isNullable: false,
            comment: '1-stellarOB, 2-bscOB',
          },
          {
            name: 'stellar_id',
            type: 'varchar',
            isNullable: true,
            isUnique: true,
          },
          {
            name: 'pool_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'buy_amount',
            type: 'decimal',
            precision: 40,
            scale: 8,
            isNullable: true,
          },
          {
            name: 'sell_amount',
            type: 'decimal',
            precision: 40,
            scale: 8,
            isNullable: true,
          },
          {
            name: 'txid',
            type: 'varchar',
            isNullable: true,
            default: null,
          },
          {
            name: 'created_at',
            type: 'datetime(3)',
            default: 'CURRENT_TIMESTAMP(3)',
          },
          {
            name: 'updated_at',
            type: 'datetime(3)',
            default: 'CURRENT_TIMESTAMP(3)',
          },
        ],
      }),
      true,
    );
    await queryRunner.createIndices('trades', [
      new TableIndex({
        columnNames: ['pair_id'],
        isUnique: false,
      }),
      new TableIndex({
        columnNames: ['buy_user_id'],
        isUnique: false,
      }),
      new TableIndex({
        columnNames: ['sell_user_id'],
        isUnique: false,
      }),
      new TableIndex({
        columnNames: ['buy_order_id'],
        isUnique: false,
      }),
      new TableIndex({
        columnNames: ['sell_order_id'],
        isUnique: false,
      }),
      new TableIndex({
        columnNames: ['buy_address'],
        isUnique: false,
      }),
      new TableIndex({
        columnNames: ['sell_address'],
        isUnique: false,
      }),
      new TableIndex({
        columnNames: ['method'],
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
      new TableIndex({
        columnNames: ['updated_at'],
        isUnique: false,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('trades');
  }
}
