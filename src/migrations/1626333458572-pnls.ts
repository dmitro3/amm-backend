import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class pnls1626333458572 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'pnls',
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
            name: 'balance',
            type: 'decimal',
            precision: 40,
            scale: 8,
            isNullable: false,
          },
          {
            name: 'rate',
            type: 'decimal',
            precision: 40,
            scale: 8,
            isNullable: false,
          },
          {
            name: 'trade_amount',
            type: 'decimal',
            precision: 40,
            scale: 8,
            isNullable: false,
            default: '0',
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
    await queryRunner.dropTable('pnls');
  }
}
