import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class loginHistories1625208077403 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'login_histories',
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
            name: 'ip',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'device',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndices('login_histories', [
      new TableIndex({
        columnNames: ['user_id'],
        isUnique: false,
      }),
      new TableIndex({
        columnNames: ['ip'],
        isUnique: false,
      }),
      new TableIndex({
        columnNames: ['created_at'],
        isUnique: false,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('login_histories');
  }
}
