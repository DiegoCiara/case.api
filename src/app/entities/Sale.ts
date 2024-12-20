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
import Deal from './Deal';
import Commission from './Commission';

@Entity({ name: 'sales' })
class Sale extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Workspace, (token) => token.sales)
  @JoinColumn([{ name: 'workspace', referencedColumnName: 'id' }])
  workspace!: Workspace;

  @ManyToOne(() => Deal, (token) => token.sales)
  @JoinColumn([{ name: 'deal', referencedColumnName: 'id' }])
  deal!: Deal;

  @ManyToOne(() => Commission, (token) => token.sales)
  @JoinColumn([{ name: 'commission', referencedColumnName: 'id' }])
  commission!: Commission;

  @Column({ type: 'float' })
  value!: number;

  @Column({ type: 'enum', enum: ['INPROGRESS', 'WON', 'LOST', 'PENDING'], default: 'INPROGRESS' })
  status!: string;

  @Column({ type: 'jsonb', nullable: true })
  additional!: any;

  @Column({ nullable: true })
  deadline!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date;
}

export default Sale;

