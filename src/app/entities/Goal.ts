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
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import Workspace from './Workspace';
import Product from './Product';
import Access from './Access';

@Entity({ name: 'goals' })
class Goal extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'float' })
  goal!: number;

  @Column({ type: 'float' })
  value!: number;

  @Column()
  type!: string;

  @Column({ type: 'float' })
  valueRecurrence!: number;

  @Column()
  typeRecurrence!: string;

  @ManyToOne(() => Workspace, (user) => user.goals)
  @JoinColumn([{ name: 'workspace', referencedColumnName: 'id' }])
  workspace!: Workspace;

  @ManyToOne(() => Product, (user) => user.goals, { nullable: true })
  @JoinColumn([{ name: 'product', referencedColumnName: 'id' }])
  product!: Product;

  @ManyToMany(() => Access, (deal) => deal.goals)
  @JoinTable()
  accesses!: Access[];

  @Column({ default: true })
  active!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date; // Modificação feita aqui para permitir valores nulos
}

export default Goal;

