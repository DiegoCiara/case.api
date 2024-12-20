import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class createMessage1631039612336 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'messages',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'thread',
            type: 'uuid',
          },
          {
            name: 'workspace',
            type: 'uuid',
          },
          {
            name: 'contact',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'viewed',
            type: 'boolean',
            default: false,
          },
          {
            name: 'user',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'content',
            type: 'varchar',
          },
          {
            name: 'type',
            type: 'varchar',
          },
          {
            name: 'mediaUrl',
            type: 'varchar',
          },
          {
            name: 'from',
            type: 'enum',
            enum: ['ASSISTANT', 'CONTACT', 'USER'],
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
      'messages',
      new TableForeignKey({
        columnNames: ['thread'],
        referencedTableName: 'threads',
        referencedColumnNames: ['id'],
      })
    );
    await queryRunner.createForeignKey(
      'messages',
      new TableForeignKey({
        columnNames: ['workspace'],
        referencedTableName: 'workspaces',
        referencedColumnNames: ['id'],
      })
    );
    await queryRunner.createForeignKey(
      'messages',
      new TableForeignKey({
        columnNames: ['user'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('messages');
  }
}

