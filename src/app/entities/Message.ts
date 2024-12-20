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
import Thread from './Thread';
import User from './User';
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

  @ManyToOne(() => User, (user) => user.messages, { nullable: true })
  @JoinColumn([{ name: 'user', referencedColumnName: 'id' }])
  user!: User;

  @Column({ type: 'enum', enum: ['ASSISTANT', 'USER'] })
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

