import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class createGoal1631039612350 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'goals',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'goal',
            type: 'float',
          },
          {
            name: 'value',
            type: 'float',
          },
          {
            name: 'type',
            type: 'varchar',
          },
          {
            name: 'valueRecurrence',
            type: 'float',
          },
          {
            name: 'typeRecurrence',
            type: 'varchar',
          },
          {
            name: 'workspace',
            type: 'uuid',
          },
          {
            name: 'product',
            type: 'uuid',
            isNullable: true
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
      'goals',
      new TableForeignKey({
        columnNames: ['workspace'],
        referencedTableName: 'workspaces',
        referencedColumnNames: ['id'],
      })
    );
    await queryRunner.createForeignKey(
      'goals',
      new TableForeignKey({
        columnNames: ['product'],
        referencedTableName: 'products',
        referencedColumnNames: ['id'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('goals');
  }
}

