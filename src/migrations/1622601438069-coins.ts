import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class coins1622601438069 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'coins',
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
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'symbol',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'stellar_issuer',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'bsc_address',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'decimal',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'int',
            isNullable: false,
            comment: 'Stellar asset type: 1-native,2-credit_alphanum4,3-credit_alphanum12',
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
    await queryRunner.dropTable('coins');
  }
}
