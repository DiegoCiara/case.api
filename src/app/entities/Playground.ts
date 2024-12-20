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
import Access from './Access';
import PlaygroundMessage from './PlaygroundMessage';

@Entity({ name: 'playgrounds' })
class Playground extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Workspace, (user) => user.playgrounds)
  @JoinColumn([{ name: 'workspace', referencedColumnName: 'id' }])
  workspace!: Workspace;

  @ManyToOne(() => Access, (user) => user.playgrounds)
  @JoinColumn([{ name: 'user', referencedColumnName: 'id' }])
  user!: Access;

  @ManyToOne(() => Assistant, (user) => user.playgrounds)
  @JoinColumn([{ name: 'assistant', referencedColumnName: 'id' }])
  assistant!: Assistant;

  @OneToMany(() => PlaygroundMessage, (deal) => deal.playground)
  messages!: PlaygroundMessage[];

  @Column()
  name!: string;

  @Column({ type: 'float', default: 0 })
  total_tokens!: number;

  @Column({ type: 'float', default: 0 })
  completion_tokens!: number;

  @Column({ type: 'float', default: 0 })
  prompt_tokens!: number;

  @Column()
  threadId!: string;

  @Column({ default: true })
  active!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date; // Modificação feita aqui para permitir valores nulos
}

export default Playground;

