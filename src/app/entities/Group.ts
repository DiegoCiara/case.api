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
import LandingPage from './LandingPage';
import Profile from './Profile';
import Commission from './Commission';

@Entity({ name: 'groups' })
class Group extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string; //Texto retornado pela ia

  @Column({ nullable: true })
  description!: string; //Texto retornado pela ia

  @ManyToOne(() => Workspace, (user) => user.groups)
  @JoinColumn([{ name: 'workspace', referencedColumnName: 'id' }])
  workspace!: Workspace;

  @ManyToMany(() => Customer, (deal) => deal.groups)
  customers!: Customer[];

  @ManyToMany(() => Profile, (deal) => deal.groups)
  profiles!: Profile[];

  @OneToMany(() => LandingPage, (document) => document.group)
  landingpages!: LandingPage[];

  @OneToMany(() => Commission, (document) => document.group)
  commissions!: Commission[];

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

export default Group;

