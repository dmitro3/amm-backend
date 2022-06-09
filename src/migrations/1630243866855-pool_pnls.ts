import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class poolPnls1630243866855 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'pool_pnls',
        columns: [
          {
            name: 'date',
            type: 'date',
            isPrimary: true,
            isNullable: false,
          },

          {
            name: 'user_id',
            type: 'int',
            isPrimary: true,
            isNullable: false,
          },
          {
            name: 'wallet',
            type: 'varchar',
            isPrimary: true,
            isNullable: false,
          },
          {
            name: 'symbol',
            type: 'varchar',
            isPrimary: true,
            isNullable: false,
          },
          {
            name: 'pool_id',
            type: 'varchar',
            isPrimary: true,
            isNullable: false,
          },
          {
            name: 'balance',
            type: 'decimal',
            precision: 40,
            scale: 8,
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
            name: 'transfer_amount',
            type: 'decimal',
            precision: 40,
            scale: 8,
            isNullable: false,
            default: '0',
          },
          {
            name: 'created_at',
            type: 'datetime',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('pool_pnls');
  }
}
