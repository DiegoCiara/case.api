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
import Message from './Message';
import Token from './Token';
import User from './User';
import Whisper from './Whisper';
import Vision from './Vision';
import Assistant from './Assistant';

@Entity({ name: 'threads' })
class Thread extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true })
  threadId!: string;

  @ManyToOne(() => Workspace, (user) => user.threads)
  @JoinColumn([{ name: 'workspace', referencedColumnName: 'id' }])
  workspace!: Workspace;

  @ManyToOne(() => Assistant, (user) => user.threads)
  @JoinColumn([{ name: 'assistant', referencedColumnName: 'id' }])
  assistant!: Assistant;

  @ManyToOne(() => User, (user) => user.threads, { nullable: true })
  @JoinColumn([{ name: 'user', referencedColumnName: 'id' }])
  user!: User;

  @OneToMany(() => Message, (token) => token.thread)
  messages!: Message[];

  @OneToMany(() => Token, (token) => token.thread)
  tokens!: Token[];

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

