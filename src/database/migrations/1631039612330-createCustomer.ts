import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class createCustomer1631039612330 implements MigrationInterface {
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
            name: 'workspace',
            type: 'uuid',
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'cpfCnpj',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'contact',
            type: 'uuid',
          },
          {
            name: 'origin',
            type: 'uuid',
          },
          {
            name: 'activity',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'auth',
            type: 'jsonb',
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
    await queryRunner.createForeignKey(
      'customers',
      new TableForeignKey({
        columnNames: ['origin'],
        referencedTableName: 'origins',
        referencedColumnNames: ['id'],
      })
    );
    await queryRunner.createForeignKey(
      'customers',
      new TableForeignKey({
        columnNames: ['contact'],
        referencedTableName: 'contacts',
        referencedColumnNames: ['id'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('customers');
  }
}

