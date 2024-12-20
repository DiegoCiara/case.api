import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class createAssistant1631039612325 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'assistants',
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
            name: 'model',
            type: 'varchar',
          },
          {
            name: 'purpose',
            type: 'varchar'
          },
          {
            name: 'openaiAssistantId',
            type: 'varchar',
          },
          {
            name: 'active',
            type: 'boolean',
            default: true,
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
      'assistants',
      new TableForeignKey({
        columnNames: ['workspace'],
        referencedTableName: 'workspaces',
        referencedColumnNames: ['id'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('assistants');
  }
}

