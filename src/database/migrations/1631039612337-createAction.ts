import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class createAction1631039612337 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'actions',
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
            name: 'assistant',
            type: 'uuid',
          },
          {
            name: 'thread',
            type: 'uuid',
          },

          {
            name: 'output',
            type: 'jsonb',
          },
          {
            name: 'arguments',
            type: 'jsonb',
            isNullable: true
          },
          {
            name: 'callId',
            type: 'varchar',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['COMPLETED', 'FAILED'],
            default: `'COMPLETED'`,
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
      'actions',
      new TableForeignKey({
        columnNames: ['workspace'],
        referencedTableName: 'workspaces',
        referencedColumnNames: ['id'],
      })
    );
    await queryRunner.createForeignKey(
      'actions',
      new TableForeignKey({
        columnNames: ['assistant'],
        referencedTableName: 'assistants',
        referencedColumnNames: ['id'],
      })
    );
    await queryRunner.createForeignKey(
      'actions',
      new TableForeignKey({
        columnNames: ['thread'],
        referencedTableName: 'threads',
        referencedColumnNames: ['id'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('actions');
  }
}

