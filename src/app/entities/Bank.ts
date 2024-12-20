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
import Commission from './Commission';

@Entity({ name: 'banks' })
class Bank extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string; //Texto retornado pela ia

  @ManyToOne(() => Workspace, (user) => user.banks)
  @JoinColumn([{ name: 'workspace', referencedColumnName: 'id' }])
  workspace!: Workspace;

  @Column()
  color!: string;

  @OneToMany(() => Commission, (commission) => commission.bank)
  commissions!: Commission[];

  @Column({ default: true })
  active!: boolean; //Texto retornado pela ia

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date; // Modificação feita aqui para permitir valores nulos
}

export default Bank;

