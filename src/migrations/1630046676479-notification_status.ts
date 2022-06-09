import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class notificationStatus1630046676479 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'notification_status',
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
            name: 'notification_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'is_read',
            type: 'tinyint',
            isNullable: false,
            comment: '0- not read, 1-read',
            default: '0',
          },
          {
            name: 'is_show',
            type: 'tinyint',
            isNullable: false,
            comment: '0- not show, 1-show',
            default: '0',
          },
          {
            name: 'is_trash',
            type: 'tinyint',
            isNullable: false,
            comment: '0- no, 1- trash',
            default: '0',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndices('notification_status', [
      new TableIndex({
        columnNames: ['user_id', 'notification_id', 'is_read', 'is_show', 'is_trash'],
        isUnique: false,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('notification_status');
  }
}
