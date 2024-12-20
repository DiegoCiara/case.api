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
import Contact from './Contact';
import Message from './Message';
import Token from './Token';
import Deal from './Deal';
import Action from './Action';
import User from './User';
import Whisper from './Whisper';
import Vision from './Vision';
import Assistant from './Assistant';
import LandingPage from './LandingPage';

@Entity({ name: 'threads' })
class Thread extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true })
  threadId!: string;

  @ManyToOne(() => Workspace, (user) => user.threads)
  @JoinColumn([{ name: 'workspace', referencedColumnName: 'id' }])
  workspace!: Workspace;

  @ManyToOne(() => Contact, (user) => user.threads, { nullable: true })
  @JoinColumn([{ name: 'contact', referencedColumnName: 'id' }])
  contact!: Contact;

  @ManyToOne(() => Assistant, (user) => user.threads)
  @JoinColumn([{ name: 'assistant', referencedColumnName: 'id' }])
  assistant!: Assistant;

  @ManyToOne(() => User, (user) => user.threads, { nullable: true })
  @JoinColumn([{ name: 'user', referencedColumnName: 'id' }])
  user!: User;

  @ManyToOne(() => LandingPage, (user) => user.threads, { nullable: true })
  @JoinColumn([{ name: 'landingpage', referencedColumnName: 'id' }])
  landingpage!: LandingPage;

  @ManyToOne(() => Deal, (user) => user.threads)
  @JoinColumn([{ name: 'deal', referencedColumnName: 'id' }])
  deal!: Deal;

  @OneToMany(() => Message, (token) => token.thread)
  messages!: Message[];

  @OneToMany(() => Token, (token) => token.thread)
  tokens!: Token[];

  @OneToMany(() => Action, (token) => token.thread)
  actions!: Action[];

  @OneToMany(() => Whisper, (token) => token.thread)
  whispers!: Whisper[];

  @OneToMany(() => Vision, (token) => token.thread)
  visions!: Vision[];

  @Column({ type: 'enum', enum: ['ASSISTANT', 'USER'], default: 'ASSISTANT' })
  responsible!: string;

  @Column()
  name!: string;

  @Column()
  chatActive!: boolean;

  @Column()
  usage!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date; // Modificação feita aqui para permitir valores nulos
}

export default Thread;

