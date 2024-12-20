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
import Deal from './Deal';
import Thread from './Thread';
import Message from './Message';
import Customer from './Customer';

@Entity({ name: 'contacts' })
class Contact extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true })
  phone!: string;

  @Column({ nullable: true })
  email!: string;

  @ManyToOne(() => Workspace, (token) => token.contacts)
  @JoinColumn([{ name: 'workspace', referencedColumnName: 'id' }])
  workspace!: Workspace;

  @OneToOne(() => Customer, (token) => token.contact)
  customer!: Customer;

  @OneToMany(() => Thread, (token) => token.contact)
  threads!: Thread[];

  @OneToMany(() => Message, (token) => token.contact)
  messages!: Message[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date;
}

export default Contact;

