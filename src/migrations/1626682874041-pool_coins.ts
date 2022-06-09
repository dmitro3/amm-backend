import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class poolCoin1626682874041 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'pool_coins',
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
            name: 'pool_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'coin_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'weight',
            type: 'decimal',
            isNullable: false,
          },
          {
            name: 'is_active',
            type: 'tinyint',
            default: '1',
            comment: '1 - active, 0 -deactive',
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

    await queryRunner.createIndices('pool_coins', [
      new TableIndex({
        columnNames: ['pool_id'],
        isUnique: false,
      }),
      new TableIndex({
        columnNames: ['coin_id'],
        isUnique: false,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('pool_coins');
  }
}
