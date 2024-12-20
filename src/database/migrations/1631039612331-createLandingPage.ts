import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class createLandingPage1631039612331 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'landingpages',
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
            name: 'group',
            type: 'uuid',
          },
          {
            name: 'commission',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'pipeline',
            type: 'uuid',
          },
          {
            name: 'origin',
            type: 'uuid',
          },
          {
            name: 'assistant',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'domain',
            type: 'varchar',
          },
          {
            name: 'redirectTo',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'assistantInstructions',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'enableCustomerSelectProfile',
            type: 'boolean',
            default: false
          },
          {
            name: 'initialPricing',
            type: 'float',
            isNullable: true,
          },
          {
            name: 'hasFollowUp',
            type: 'boolean',
            default: false,
          },
          {
            name: 'followUpType',
            type: 'varchar',
            default: `'wpp'`,
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
      'landingpages',
      new TableForeignKey({
        columnNames: ['workspace'],
        referencedTableName: 'workspaces',
        referencedColumnNames: ['id'],
      })
    );
    await queryRunner.createForeignKey(
      'landingpages',
      new TableForeignKey({
        columnNames: ['group'],
        referencedTableName: 'groups',
        referencedColumnNames: ['id'],
      })
    );
    await queryRunner.createForeignKey(
      'landingpages',
      new TableForeignKey({
        columnNames: ['assistant'],
        referencedTableName: 'assistants',
        referencedColumnNames: ['id'],
      })
    );
    await queryRunner.createForeignKey(
      'landingpages',
      new TableForeignKey({
        columnNames: ['origin'],
        referencedTableName: 'origins',
        referencedColumnNames: ['id'],
      })
    );
    await queryRunner.createForeignKey(
      'landingpages',
      new TableForeignKey({
        columnNames: ['pipeline'],
        referencedTableName: 'pipelines',
        referencedColumnNames: ['id'],
      })
    );
    await queryRunner.createForeignKey(
      'landingpages',
      new TableForeignKey({
        columnNames: ['commission'],
        referencedTableName: 'commissions',
        referencedColumnNames: ['id'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('landingpages');
  }
}

