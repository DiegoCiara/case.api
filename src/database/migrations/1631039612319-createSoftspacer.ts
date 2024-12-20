
import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class createSoftspacer1631039612319 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'softspacers',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'picture',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'cnpj',
            type: 'varchar',
          },
          {
            name: 'responsibleName',
            type: 'varchar',
          },
          {
            name: 'responsibleCpf',
            type: 'varchar',
          },
          {
            name: 'responsiblePhone',
            type: 'varchar',
          },
          {
            name: 'responsibleEmail',
            type: 'varchar',
          },
          {
            name: 'asaasCustomerId',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'cep',
            type: 'varchar',
          },
          {
            name: 'address',
            type: 'varchar',
          },
          {
            name: 'addressNumber',
            type: 'varchar',
          },
          {
            name: 'province',
            type: 'varchar',
          },
          {
            name: 'city',
            type: 'varchar',
          },
          {
            name: 'state',
            type: 'varchar',
            default: `'PE'`
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
    await queryRunner.dropTable('softspacers');
  }
}
