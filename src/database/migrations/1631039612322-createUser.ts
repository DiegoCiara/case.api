import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class createUser1631039612322 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'picture',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'email',
            type: 'varchar',
          },
          {
            name: 'customer_id',
            type: 'varchar',
          },
          {
            name: 'password_hash',
            type: 'varchar',
          },
          {
            name: 'token_reset_password',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'reset_password_expires',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'secret',
            type: 'varchar',
          },
          {
            name: 'token_auth_secret',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'has_configured_2fa',
            type: 'boolean',
            default: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'deletedAt',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}
