import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class createPlaygroundMessage1631039612359 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'playgroundmessages',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'playground',
            type: 'uuid',
          },
          {
            name: 'workspace',
            type: 'uuid',
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
            isNullable: true,
          },
          {
            name: 'from',
            type: 'enum',
            enum: ['ASSISTANT', 'USER'],
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
      'playgroundmessages',
      new TableForeignKey({
        columnNames: ['playground'],
        referencedTableName: 'playgrounds',
        referencedColumnNames: ['id'],
      })
    );
    await queryRunner.createForeignKey(
      'playgroundmessages',
      new TableForeignKey({
        columnNames: ['workspace'],
        referencedTableName: 'workspaces',
        referencedColumnNames: ['id'],
      })
    );
    await queryRunner.createForeignKey(
      'playgroundmessages',
      new TableForeignKey({
        columnNames: ['user'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('playgroundmessages');
  }
}

