import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import User from './User';
import Workspace from './Workspace';
import Thread from './Thread';
import Token from './Token';
import Message from './Message';
import Customer from './Customer';
import Bank from './Bank';
import Partner from './Partner';
import Product from './Product';
import Sale from './Sale';
import LandingPage from './LandingPage';
import Group from './Group';

@Entity({ name: 'commissions' })
class Commission extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string; //Texto retornado pela ia

  @Column({ type: 'float' })
  value!: number; //Texto retornado pela ia

  @Column()
  type!: string; //Texto retornado pela ia

  @Column({ type: 'float' })
  valueRecurrence!: number; //Texto retornado pela ia

  @Column()
  typeRecurrence!: string; //Texto retornado pela ia

  @ManyToOne(() => Workspace, (user) => user.commissions)
  @JoinColumn([{ name: 'workspace', referencedColumnName: 'id' }])
  workspace!: Workspace;

  @ManyToOne(() => Bank, (user) => user.commissions)
  @JoinColumn([{ name: 'bank', referencedColumnName: 'id' }])
  bank!: Bank;

  @ManyToOne(() => Partner, (user) => user.commissions)
  @JoinColumn([{ name: 'partner', referencedColumnName: 'id' }])
  partner!: Partner;

  @ManyToOne(() => Product, (user) => user.commissions)
  @JoinColumn([{ name: 'product', referencedColumnName: 'id' }])
  product!: Product;

  @ManyToOne(() => Group, (user) => user.commissions)
  @JoinColumn([{ name: 'group', referencedColumnName: 'id' }])
  group!: Group;

  @OneToMany(() => Sale, (sale) => sale.commission)
  sales!: Sale[];

  @OneToMany(() => LandingPage, (sale) => sale.commission)
  landingpages!: LandingPage[];

  @Column({ default: false })
  hasRepresentant!: boolean; //Texto retornado pela ia

  @Column({ default: '84'})
  term!: string; //Texto retornado pela ia

  @Column({ default: true })
  active!: boolean; //Texto retornado pela ia

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date; // Modificação feita aqui para permitir valores nulos
}

export default Commission;

