import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class createCustomer1631039612324 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'customers',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
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
            name: 'workspace',
            type: 'uuid',
          },
          {
            name: 'hasResetPass',
            type: 'boolean',
            isNullable: true
          },
          {
            name: 'passwordHash',
            type: 'varchar',
          },
          {
            name: 'picture',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'notifyEnabled',
            type: 'boolean',
            default: true,
          },
          {
            name: 'passwordResetToken',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'passwordResetExpires',
            type: 'varchar',
            isNullable: true,
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
    await queryRunner.createForeignKey(
      'customers',
      new TableForeignKey({
        columnNames: ['workspace'],
        referencedTableName: 'workspaces',
        referencedColumnNames: ['id'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('customers');
  }
}
