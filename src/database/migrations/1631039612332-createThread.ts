import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class createThread1631039612332 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'threads',
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
            isNullable: true,
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
            name: 'deal',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'contact',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'landingpage',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'user',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'responsible',
            type: 'enum',
            enum: ['ASSISTANT', 'USER'],
            default: `'ASSISTANT'`,
          },
          {
            name: 'usage',
            type: 'varchar',
          },
          {
            name: 'chatActive',
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
      'threads',
      new TableForeignKey({
        columnNames: ['assistant'],
        referencedTableName: 'assistants',
        referencedColumnNames: ['id'],
      })
    );
    await queryRunner.createForeignKey(
      'threads',
      new TableForeignKey({
        columnNames: ['workspace'],
        referencedTableName: 'workspaces',
        referencedColumnNames: ['id'],
      })
    );
    await queryRunner.createForeignKey(
      'threads',
      new TableForeignKey({
        columnNames: ['contact'],
        referencedTableName: 'contacts',
        referencedColumnNames: ['id'],
      })
    );
    await queryRunner.createForeignKey(
      'threads',
      new TableForeignKey({
        columnNames: ['user'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
      })
    );
    await queryRunner.createForeignKey(
      'threads',
      new TableForeignKey({
        columnNames: ['deal'],
        referencedTableName: 'deals',
        referencedColumnNames: ['id'],
      })
    );
    await queryRunner.createForeignKey(
      'threads',
      new TableForeignKey({
        columnNames: ['landingpage'],
        referencedTableName: 'landingpages',
        referencedColumnNames: ['id'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('threads');
  }
}

