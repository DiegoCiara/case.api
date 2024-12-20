import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class createCommission1631039612330 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'commissions',
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
            name: 'group',
            type: 'uuid',
          },
          {
            name: 'product',
            type: 'uuid',
          },
          {
            name: 'bank',
            type: 'uuid',
          },
          {
            name: 'partner',
            type: 'uuid',
          },
          {
            name: 'active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'hasRepresentant',
            type: 'boolean',
            default: false,
          },
          {
            name: 'term',
            type: 'varchar',
            default: `'84'`,
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
      'commissions',
      new TableForeignKey({
        columnNames: ['workspace'],
        referencedTableName: 'workspaces',
        referencedColumnNames: ['id'],
      })
    );
    await queryRunner.createForeignKey(
      'commissions',
      new TableForeignKey({
        columnNames: ['bank'],
        referencedTableName: 'banks',
        referencedColumnNames: ['id'],
      })
    );
    await queryRunner.createForeignKey(
      'commissions',
      new TableForeignKey({
        columnNames: ['group'],
        referencedTableName: 'groups',
        referencedColumnNames: ['id'],
      })
    );
    await queryRunner.createForeignKey(
      'commissions',
      new TableForeignKey({
        columnNames: ['partner'],
        referencedTableName: 'partners',
        referencedColumnNames: ['id'],
      })
    );
    await queryRunner.createForeignKey(
      'commissions',
      new TableForeignKey({
        columnNames: ['product'],
        referencedTableName: 'products',
        referencedColumnNames: ['id'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('commissions');
  }
}

