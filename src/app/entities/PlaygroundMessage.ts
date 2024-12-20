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
import Playground from './Playground';

@Entity({ name: 'playgroundmessages' })
class PlaygroundMessage extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Playground, (user) => user.messages)
  @JoinColumn([{ name: 'playground', referencedColumnName: 'id' }])
  playground!: Playground;

  @ManyToOne(() => Workspace, (user) => user.playgroundmessages)
  @JoinColumn([{ name: 'workspace', referencedColumnName: 'id' }])
  workspace!: Workspace;

  @ManyToOne(() => User, (user) => user.messages, { nullable: true })
  @JoinColumn([{ name: 'user', referencedColumnName: 'id' }])
  user!: User;

  @Column({ type: 'enum', enum: ['ASSISTANT', 'USER'] })
  from!: string;

  @Column()
  content!: string;

  @Column()
  type!: string;

  @Column({ nullable: true })
  mediaUrl!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date; // Modificação feita aqui para permitir valores nulos
}

export default PlaygroundMessage;

