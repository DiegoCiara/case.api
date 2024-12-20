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
import User from './User';
import Workspace from './Workspace';
import Thread from './Thread';
import Token from './Token';

import Message from './Message';
import Customer from './Customer';
import LandingPage from './LandingPage';
import Group from './Group';
import Product from './Product';

@Entity({ name: 'profiles' })
class Profile extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string; //Texto retornado pela ia

  @Column({ nullable: true })
  description!: string; //Texto retornado pela ia

  @Column({ type: 'jsonb', nullable: true })
  params!: any; //Texto retornado pela ia

  @ManyToOne(() => Workspace, (user) => user.profiles)
  @JoinColumn([{ name: 'workspace', referencedColumnName: 'id' }])
  workspace!: Workspace;

  @ManyToMany(() => Customer, (deal) => deal.profiles)
  customers!: Customer[];

  @ManyToMany(() => Product, (deal) => deal.profiles)
  products!: Product[];

  @ManyToMany(() => Group, (deal) => deal.profiles)
  @JoinTable()
  groups!: Group[];

  @ManyToMany(() => LandingPage, (document) => document.profiles)
  landingpages!: LandingPage[];

  @Column()
  color!: string;

  @Column({ default: true })
  active!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date; // Modificação feita aqui para permitir valores nulos
}

export default Profile;

