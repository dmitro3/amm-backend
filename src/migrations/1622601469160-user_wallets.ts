import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class userWallets1622601469160 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_wallets',
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
            name: 'address',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'network',
            type: 'int',
            isNullable: false,
            comment: '1 - bsc, 2 - stellar',
          },
          {
            name: 'status',
            type: 'tinyint',
            default: '3',
            comment: '1 - approved, 2 - pending, 3 - submit, 4 - blocked',
          },
          {
            name: 'is_active',
            type: 'tinyint',
            default: '3',
            comment: '1 - approved, 2 - pending, 3 - submit, 4 - blocked',
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
    await queryRunner.createIndices('user_wallets', [
      new TableIndex({
        columnNames: ['user_id'],
        isUnique: false,
      }),
      new TableIndex({
        name: 'WALLETS_ADDRESS_UNIQUE',
        columnNames: ['address', 'network'],
        isUnique: true,
      }),
      new TableIndex({
        columnNames: ['status'],
        isUnique: false,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_wallets');
  }
}
