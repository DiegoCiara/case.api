import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class createWorkspace1631039612323 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'workspaces',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'softspacer',
            type: 'uuid',
          },
          {
            name: 'companyType',
            type: 'varchar',
          },
          {
            name: 'pageLabels',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'plan',
            type: 'uuid',
          },
          {
            name: 'openaiApiKey',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'wppDelayResponse',
            type: 'int',
            default: 20, // 3 segundos
          },
          {
            name: 's3',
            type: 'int',
            default: 100, // 3 segundos
          },
          {
            name: 'wppEnabled',
            type: 'boolean',
            default: false,
          },
          {
            name: 'subscriptionAsaasId',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'apiKey',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'color',
            type: 'varchar',
          },
          {
            name: 'picture',
            type: 'varchar',
            isNullable: true,
          },
          // {
          //   name: 'role',
          //   type: 'varchar',
          // },
          {
            name: 'wppToken',
            type: 'varchar',
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
      'workspaces',
      new TableForeignKey({
        columnNames: ['softspacer'],
        referencedTableName: 'softspacers',
        referencedColumnNames: ['id'],
      })
    );
    await queryRunner.createForeignKey(
      'workspaces',
      new TableForeignKey({
        columnNames: ['plan'],
        referencedTableName: 'plans',
        referencedColumnNames: ['id'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('workspaces');
  }
}

