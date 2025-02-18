import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class createToken1631039612333 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'tokens',
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
            name: 'model',
            type: 'varchar',
          },
          {
            name: 'thread',
            type: 'uuid',
          },
          {
            name: 'total_tokens',
            type: 'float',
          },
          {
            name: 'completion_tokens',
            type: 'float',
          },
          {
            name: 'prompt_tokens',
            type: 'float',
          },
          {
            name: 'input',
            type: 'jsonb',
          },
          {
            name: 'output',
            type: 'jsonb',
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
      'tokens',
      new TableForeignKey({
        columnNames: ['workspace'],
        referencedTableName: 'workspaces',
        referencedColumnNames: ['id'],
      })
    );
    await queryRunner.createForeignKey(
      'tokens',
      new TableForeignKey({
        columnNames: ['thread'],
        referencedTableName: 'threads',
        referencedColumnNames: ['id'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('tokens');
  }
}

