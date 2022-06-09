import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class transactions1627373646984 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'transactions',
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
            name: 'type',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'network',
            type: 'tinyint',
            isNullable: false,
          },
          {
            name: 'rawId',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'txid',
            type: 'varchar',
            isNullable: true,
            default: null,
          },
          {
            name: 'signed_transaction',
            type: 'text',
            isNullable: true,
            default: null,
          },
          {
            name: 'note',
            type: 'text',
            isNullable: true,
            default: null,
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndices('transactions', [
      new TableIndex({
        columnNames: ['type', 'rawId'],
        isUnique: false,
      }),
      new TableIndex({
        columnNames: ['txid'],
        isUnique: false,
      }),
      new TableIndex({
        columnNames: ['network'],
        isUnique: false,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('trade_transactions');
  }
}
