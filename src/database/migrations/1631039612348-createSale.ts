import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class createSale1631039612348 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'sales',
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
            name: 'deal',
            type: 'uuid',
          },
          {
            name: 'commission',
            type: 'uuid',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['INPROGRESS', 'WON', 'LOST', 'PENDING'],
            default: `'INPROGRESS'`,
          },
          {
            name: 'value',
            type: 'float',
          },
          {
            name: 'additional',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'deadline',
            type: 'timestamp',
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
      'sales',
      new TableForeignKey({
        columnNames: ['workspace'],
        referencedTableName: 'workspaces',
        referencedColumnNames: ['id'],
      })
    );
    await queryRunner.createForeignKey(
      'sales',
      new TableForeignKey({
        columnNames: ['deal'],
        referencedTableName: 'deals',
        referencedColumnNames: ['id'],
      })
    );
    await queryRunner.createForeignKey(
      'sales',
      new TableForeignKey({
        columnNames: ['commission'],
        referencedTableName: 'commissions',
        referencedColumnNames: ['id'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('sales');
  }
}

