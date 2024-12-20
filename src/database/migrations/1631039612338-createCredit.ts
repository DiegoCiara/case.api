import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class createCredit1631039612338 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'credits',
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
            name: 'token',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'action',
            type: 'uuid',
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
      'credits',
      new TableForeignKey({
        columnNames: ['workspace'],
        referencedTableName: 'workspaces',
        referencedColumnNames: ['id'],
      })
    );
    await queryRunner.createForeignKey(
      'credits',
      new TableForeignKey({
        columnNames: ['token'],
        referencedTableName: 'tokens',
        referencedColumnNames: ['id'],
      })
    );
    await queryRunner.createForeignKey(
      'credits',
      new TableForeignKey({
        columnNames: ['action'],
        referencedTableName: 'actions',
        referencedColumnNames: ['id'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('credits');
  }
}

