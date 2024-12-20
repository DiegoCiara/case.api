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
import Workspace from './Workspace';
import Deal from './Deal';
import Thread from './Thread';
import Message from './Message';
import Contact from './Contact';
import Document from './Document';
import Group from './Group';
import Origin from './Origin';
import Profile from './Profile';

@Entity({ name: 'customers' })
class Customer extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  cpfCnpj!: string;

  @Column({ default: true })
  active!: boolean;

  @OneToOne(() => Contact, (user) => user.customer, { nullable: true })
  @JoinColumn([{ name: 'contact', referencedColumnName: 'id' }])
  contact!: Contact;

  @ManyToOne(() => Workspace, (token) => token.customers)
  @JoinColumn([{ name: 'workspace', referencedColumnName: 'id' }])
  workspace!: Workspace;

  @ManyToOne(() => Origin, (token) => token.customers)
  @JoinColumn([{ name: 'origin', referencedColumnName: 'id' }])
  origin!: Origin;

  @OneToMany(() => Deal, (token) => token.customer)
  deals!: Deal[];

  @OneToMany(() => Document, (token) => token.customer)
  documents!: Document[];

  @ManyToMany(() => Group, (token) => token.customers)
  @JoinTable()
  groups!: Group[];

  @ManyToMany(() => Profile , (token) => token.customers)
  @JoinTable()
  profiles!: Profile[];

  @Column({ type: 'jsonb', nullable: true })
  activity!: Array<{
    name: string;
    description: string;
    createdBy: any;
    createdAt: Date;
    json: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  auth!:{
    hasResetPass: boolean; //Guarda se o usuário resetou a senha
    passwordHash: string; //hash da senha
    passwordResetToken: string; // token de validação de expiração de senha
    passwordResetExpires: Date // Data de expiração do link de recuperação de senha
    picture: string; //foto da conta do usuário no workspace
  };

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date;
}

export default Customer;

