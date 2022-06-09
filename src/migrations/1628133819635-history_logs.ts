import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class historyLogs1628133819635 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'history_logs',
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
            name: 'activity_type',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'admin_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'wallet',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'activities',
            type: 'text',
            isNullable: false,
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

    await queryRunner.createIndices('history_logs', [
      new TableIndex({
        columnNames: ['admin_id'],
        isUnique: false,
      }),
      new TableIndex({
        columnNames: ['activity_type'],
        isUnique: false,
      }),
      new TableIndex({
        columnNames: ['wallet'],
        isUnique: false,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('history_logs');
  }
}
