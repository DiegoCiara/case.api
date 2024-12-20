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
import Deal from './Deal';
import Commission from './Commission';
import Goal from './Goal';
import Profile from './Profile';

@Entity({ name: 'products' })
class Product extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description!: string;

  // @Column({type: 'float', default: 0})
  // value!: number;

  // @Column({type: 'float', default: 0})
  // recurrence!: number;

  @Column({ default: true })
  active!: boolean; //Texto retornado pela ia

  @Column()
  color!: string;

  @ManyToMany(() => Commission, (deal) => deal.product)
  commissions!: Commission[];

  @ManyToOne(() => Workspace, (token) => token.products)
  @JoinColumn([{ name: 'workspace', referencedColumnName: 'id' }])
  workspace!: Workspace;

  @OneToMany(() => Goal, (credit) => credit.workspace)
  goals!: Goal[];

  @ManyToMany(() => Profile , (token) => token.products)
  @JoinTable()
  profiles!: Profile[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date; // Modificação feita aqui para permitir valores nulos
}

export default Product;

