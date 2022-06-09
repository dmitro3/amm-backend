import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class gradually1630895978527 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'gradually',
        columns: [
          {
            name: 'pool_address',
            type: 'varchar',
            isPrimary: true,
          },
          {
            name: 'start_block',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'end_block',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'old_weights',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'new_weights',
            type: 'text',
            isNullable: false,
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('gradually');
  }
}
