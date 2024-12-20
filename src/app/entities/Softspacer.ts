import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import Workspace from './Workspace';
import CreditCard from './CreditCard';
import Message from './Message';
import Access from './Access';
import Deal from './Deal';
import Task from './Task';
import Notification from './Notification';
import Thread from './Thread';
import Log from './Log';
import User from './User';

@Entity({ name: 'softspacers' })
class Softspacer extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true })
  picture!: string;

  @Column()
  name!: string;

  @Column()
  cnpj!: string;

  @Column()
  responsibleName!: string;

  @Column()
  responsibleCpf!: string;

  @Column()
  responsiblePhone!: string;

  @Column()
  responsibleEmail!: string;

  @Column({ nullable: true })
  asaasCustomerId!: string;

  @Column()
  cep!: string;

  @Column({ nullable: true })
  address!: string;

  @Column({ nullable: true })
  addressNumber!: string;

  @Column({ nullable: true })
  province!: string;

  @Column({ nullable: true })
  city!: string;

  @Column({ default: 'PE' })
  state!: string;

  @OneToMany(() => CreditCard, (card) => card.softspacer)
  creditCards!: CreditCard[];

  @OneToMany(() => User, (card) => card.softspacer)
  owners!: User[];

  @OneToMany(() => Workspace, (card) => card.softspacer)
  workspaces!: Workspace[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date; // Modificação feita aqui para permitir valores nulos
}

export default Softspacer;

