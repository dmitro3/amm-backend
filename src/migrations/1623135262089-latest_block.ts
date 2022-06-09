import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class latestBlock1623135262089 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'latest_block',
        columns: [
          {
            name: 'network',
            type: 'varchar',
          },
          {
            name: 'type',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'block',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'tinyint',
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

    await queryRunner.createIndex(
      'latest_block',
      new TableIndex({
        name: 'CURRENCY_TYPE_UNIQUE',
        columnNames: ['network', 'type'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('latest_block');
  }
}
