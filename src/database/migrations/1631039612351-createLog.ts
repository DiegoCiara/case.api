import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class createLog1631039612351 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'logs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'table',
            type: 'varchar',
          },
          {
            name: 'user',
            type: 'uuid',
          },
          {
            name: 'status',
            type: 'varchar',
          },
          {
            name: 'operation',
            type: 'varchar',
          },
          {
            name: 'data',
            type: 'varchar', //req.body or error
          },
          {
            name: 'target',
            type: 'jsonb',
            isNullable: true
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
      'logs',
      new TableForeignKey({
        columnNames: ['user'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('logs');
  }
}

