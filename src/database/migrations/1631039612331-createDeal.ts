import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class createDeal1631039612331 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'deals',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'pipeline',
            type: 'uuid',
          },
          {
            name: 'customer',
            type: 'uuid',
          },
          {
            name: 'workspace',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'user',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['INPROGRESS', 'WON', 'LOST', 'PENDING', 'ARCHIVED'],
            default: `'INPROGRESS'`,
          },
          {
            name: 'observations',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'deadline',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'activity',
            type: 'jsonb',
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
      'deals',
      new TableForeignKey({
        columnNames: ['pipeline'],
        referencedTableName: 'pipelines',
        referencedColumnNames: ['id'],
      })
    );
    await queryRunner.createForeignKey(
      'deals',
      new TableForeignKey({
        columnNames: ['customer'],
        referencedTableName: 'customers',
        referencedColumnNames: ['id'],
      })
    );
    await queryRunner.createForeignKey(
      'deals',
      new TableForeignKey({
        columnNames: ['workspace'],
        referencedTableName: 'workspaces',
        referencedColumnNames: ['id'],
      })
    );
    await queryRunner.createForeignKey(
      'deals',
      new TableForeignKey({
        columnNames: ['user'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('deals');
  }
}

