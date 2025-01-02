import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class createTokenPlayground1631039612333 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'playgroundTokens',
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
            name: 'playground',
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
      'playgroundTokens',
      new TableForeignKey({
        columnNames: ['workspace'],
        referencedTableName: 'workspaces',
        referencedColumnNames: ['id'],
      })
    );
    await queryRunner.createForeignKey(
      'playgroundTokens',
      new TableForeignKey({
        columnNames: ['playground'],
        referencedTableName: 'playgrounds',
        referencedColumnNames: ['id'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('playgroundTokens');
  }
}

