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
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import Pipeline from './Pipeline';
import Contact from './Contact';
import Thread from './Thread';
import Workspace from './Workspace';
import User from './User';
import Product from './Product';
import Task from './Task';
import Customer from './Customer';
import Sale from './Sale';

@Entity({ name: 'deals' })
class Deal extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Pipeline, (token) => token.deals)
  @JoinColumn([{ name: 'pipeline', referencedColumnName: 'id' }])
  pipeline!: Pipeline;

  @ManyToOne(() => Customer, (token) => token.deals)
  @JoinColumn([{ name: 'customer', referencedColumnName: 'id' }])
  customer!: Customer;

  @ManyToOne(() => Workspace, (token) => token.deals)
  @JoinColumn([{ name: 'workspace', referencedColumnName: 'id' }])
  workspace!: Workspace;

  @ManyToOne(() => User, (token) => token.deals, { nullable: true })
  @JoinColumn([{ name: 'user', referencedColumnName: 'id' }])
  user!: User;

  @OneToMany(() => Thread, (token) => token.deal)
  threads!: Thread[];

  @OneToMany(() => Sale, (credit) => credit.deal)
  sales!: Sale[];

  @OneToMany(() => Task, (task) => task.deal)
  tasks!: Task[];

  @Column({ type: 'enum', enum: ['INPROGRESS', 'WON', 'LOST', 'PENDING', 'ARCHIVED'], default: 'INPROGRESS' })
  status!: string;

  @Column({ nullable: true })
  observations!: string;

  @Column({ type: 'jsonb', nullable: true })
  activity!: Array<{
    name: string;
    description: string;
    createdBy: any;
    createdAt: Date;
    json: string;
  }>;

  @Column({ nullable: true })
  deadline!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date;
}

export default Deal;

