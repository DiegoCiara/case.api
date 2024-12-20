
import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class createCreditCard1631039612326 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'creditCards',
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
            name: 'creditCardNumber',
            type: 'varchar',
          },
          {
            name: 'creditCardBrand',
            type: 'varchar',
          },
          {
            name: 'creditCardToken',
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
    await queryRunner.createForeignKey(
      'creditCards',
      new TableForeignKey({
        columnNames: ['softspacer'],
        referencedTableName: 'softspacers',
        referencedColumnNames: ['id'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('creditCards');
  }
}
