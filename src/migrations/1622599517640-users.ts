import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class users1622599517640 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
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
            name: 'title',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'email',
            type: 'varchar',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'company',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'position',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'fullname',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'role',
            type: 'int',
            isNullable: false,
            comment: '0: user, 1: admin, 2: super_admin',
          },
          {
            name: 'user_type',
            type: 'tinyint',
            isNullable: false,
            comment: '0: restricted, 1: unrestricted',
          },
          {
            name: 'phone',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'password',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'velo_account',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'token_reset_password',
            type: 'int(11)',
            isNullable: true,
            comment: '6 digit number to reset password',
          },
          {
            name: 'expire',
            type: 'datetime',
            isNullable: true,
            comment: 'expiration of token_reset_password',
          },
          {
            name: 'is_locked',
            type: 'tinyint(4)',
            isNullable: true,
            default: '1',
            comment: '1 - unlocked, 0 - locked',
          },
          {
            name: 'is_first_login',
            type: 'boolean',
            isNullable: true,
            default: 'false',
            comment: 'Is first login',
          },
          {
            name: 'refresh_token',
            type: 'varchar',
            default: 'NULL',
            isNullable: true,
            comment: 'refresh token',
          },
          {
            name: 'status',
            type: 'tinyint',
            default: '1',
            comment: '3 - active, 2 - pending, 1 - submit, 0 - deactive',
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
    await queryRunner.createIndices('users', [
      new TableIndex({
        columnNames: ['status'],
        isUnique: false,
      }),
      new TableIndex({
        columnNames: ['user_type'],
        isUnique: false,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}
