import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class pools1623224073185 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'pools',
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
            name: 'user_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'tinyint',
            isNullable: false,
            comment: '1-Fixed, 2-Flexible',
          },
          {
            name: 'early_withdraw_term',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'early_withdraw_fee',
            type: 'decimal',
            precision: 40,
            scale: 8,
            isNullable: false,
          },
          {
            name: 'swap_fee',
            type: 'decimal',
            precision: 40,
            scale: 8,
            isNullable: false,
          },
          {
            name: 'fee_ratio_velo',
            type: 'decimal',
            precision: 40,
            scale: 8,
            isNullable: false,
          },
          {
            name: 'fee_ratio_lp',
            type: 'decimal',
            precision: 40,
            scale: 8,
            isNullable: false,
          },
          {
            name: 'status',
            type: 'tinyint',
            isNullable: false,
            comment: '1-Pending, 2-Rejected, 3-Created',
          },
          {
            name: 'flex_right_config',
            type: 'json',
            isNullable: false,
          },
          {
            name: 'message',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'pool_address',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'datetime',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'update_at',
            type: 'datetime',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );
    await queryRunner.createIndices('pools', [
      new TableIndex({
        columnNames: ['user_id'],
        isUnique: false,
      }),
      new TableIndex({
        columnNames: ['type'],
        isUnique: false,
      }),
      new TableIndex({
        columnNames: ['status'],
        isUnique: false,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('pools');
  }
}
