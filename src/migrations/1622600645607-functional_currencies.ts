import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class functionalCurrencies1622600645607 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'functional_currencies',
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
            name: 'currency',
            type: 'varchar',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'symbol',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'iso_code',
            type: 'varchar',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'digital_credits',
            type: 'varchar',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'fractional_unit',
            type: 'varchar',
            default: '0',
          },
          {
            name: 'number_basic',
            type: 'int',
            default: '0',
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
    await queryRunner.dropTable('functional_currencies');
  }
}
