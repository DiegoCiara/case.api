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

@Entity({ name: 'origins' })
class Origin extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Workspace, (user) => user.origins)
  @JoinColumn([{ name: 'workspace', referencedColumnName: 'id' }])
  workspace!: Workspace;

  @OneToMany(() => Customer, (token) => token.origin)
  customers!: Customer[];

  @OneToMany(() => LandingPage, (token) => token.origin)
  landingpages!: LandingPage[];

  @Column()
  name!: string;

  @Column()
  color!: string;

  @Column({ default: true })
  active!: boolean; //Texto retornado pela ia

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date; // Modificação feita aqui para permitir valores nulos
}

export default Origin;

