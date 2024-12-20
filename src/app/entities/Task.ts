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
import Deal from './Deal';

@Entity({ name: 'tasks' })
class Task extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Deal, (token) => token.tasks, { nullable: true })
  @JoinColumn([{ name: 'contact', referencedColumnName: 'id' }])
  deal!: Deal;

  @ManyToOne(() => Workspace, (token) => token.tasks)
  @JoinColumn([{ name: 'workspace', referencedColumnName: 'id' }])
  workspace!: Workspace;

  @ManyToOne(() => User, (token) => token.tasks)
  @JoinColumn([{ name: 'user', referencedColumnName: 'id' }])
  user!: User;

  @Column({ type: 'enum', enum: ['PENDING', 'COMPLETED', 'CANCELED', 'ARCHIVED'], default: 'PENDING' })
  status!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description!: string;

  @Column()
  deadline!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date;
}

export default Task;

