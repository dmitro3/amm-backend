import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class pairs1622601482938 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'pairs',
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
            name: 'base_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'quote_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'price_precision',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'amount_precision',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'minimum_amount',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'minimum_total',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'group_count',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'is_active',
            type: 'tinyint',
            default: '1',
            comment: '1 - active, 0 -deactive',
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('pairs');
  }
}
