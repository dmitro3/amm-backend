import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class intervalSettings1628129957564 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'interval_settings',
        columns: [
          {
            name: 'interval',
            type: 'int',
            isPrimary: true,
            isNullable: false,
          },
          {
            name: 'by_the_interval',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'annualized',
            type: 'varchar',
            isNullable: false,
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
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('interval-settings');
  }
}
