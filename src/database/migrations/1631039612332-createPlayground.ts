import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class createPlayground1631039612332 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'playgrounds',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'threadId',
            type: 'varchar',
          },
          {
            name: 'workspace',
            type: 'uuid',
          },
          {
            name: 'user',
            type: 'uuid',
          },
          // {
          //   name: 'name',
          //   type: 'varchar',
          // },
          {
            name: 'active',
            type: 'boolean',
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
      'playgrounds',
      new TableForeignKey({
        columnNames: ['workspace'],
        referencedTableName: 'workspaces',
        referencedColumnNames: ['id'],
      })
    );
    await queryRunner.createForeignKey(
      'playgrounds',
      new TableForeignKey({
        columnNames: ['user'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('playgrounds');
  }
}

