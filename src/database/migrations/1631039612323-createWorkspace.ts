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
            name: 'subscriptionId',
            type: 'varchar',
          },
          {
            name: 'assistantId',
            type: 'varchar',
          },
          {
            name: 'vectorId',
            type: 'varchar',
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'favicon',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'assistantPicture',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'colorTheme',
            type: 'varchar',
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('workspaces');
  }
}

