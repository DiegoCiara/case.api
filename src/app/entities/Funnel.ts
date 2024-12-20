import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import User from './User';
import Workspace from './Workspace';
import Pipeline from './Pipeline';
import Access from './Access';
import Assistant from './Assistant';
// ,
// "creditCard": {
//   "creditCardNumber": "8829",
//   "creditCardBrand": "MASTERCARD",
//   "creditCardToken": "a75a1d98-c52d-4a6b-a413-71e00b193c99"
// }

@Entity({ name: 'funnels' })
class Funnel extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Workspace, (token) => token.funnels)
  @JoinColumn([{ name: 'workspace', referencedColumnName: 'id' }])
  workspace!: Workspace;

  @OneToMany(() => Pipeline, (token) => token.funnel)
  pipelines!: Pipeline[];

  @Column()
  name!: string;

  @Column({ nullable: true })
  description!: string;

  @Column({ type: 'jsonb' })
  dealParams!: any;

  @ManyToMany(() => Access, (deal) => deal.funnels)
  @JoinTable()
  accesses!: Access[];

  @ManyToMany(() => Assistant, (deal) => deal.funnels)
  assistants!: Assistant[];

  @Column({ default: true })
  active!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date;
}

export default Funnel;

