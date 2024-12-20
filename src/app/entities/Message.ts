import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import Workspace from './Workspace';
import Contact from './Contact';
import Thread from './Thread';
import User from './User';
import Action from './Action';
import Assistant from './Assistant';

@Entity({ name: 'messages' })
class Message extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Thread, (user) => user.messages)
  @JoinColumn([{ name: 'thread', referencedColumnName: 'id' }])
  thread!: Thread;

  @ManyToOne(() => Workspace, (user) => user.messages)
  @JoinColumn([{ name: 'workspace', referencedColumnName: 'id' }])
  workspace!: Workspace;

  @ManyToOne(() => Assistant, (user) => user.messages)
  @JoinColumn([{ name: 'assistant', referencedColumnName: 'id' }])
  assistant!: Assistant;

  @ManyToOne(() => Contact, (user) => user.messages, { nullable: true })
  @JoinColumn([{ name: 'contact', referencedColumnName: 'id' }])
  contact!: Contact;

  @ManyToOne(() => User, (user) => user.messages, { nullable: true })
  @JoinColumn([{ name: 'user', referencedColumnName: 'id' }])
  user!: User;

  @Column({ type: 'enum', enum: ['ASSISTANT', 'CONTACT', 'USER'] })
  from!: string;

  @Column()
  content!: string;

  @Column()
  type!: string;

  @Column({ default: false })
  viewed!: boolean;

  @Column({ nullable: true })
  mediaUrl!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date; // Modificação feita aqui para permitir valores nulos
}

export default Message;

