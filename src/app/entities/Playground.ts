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
import Token from './Token';
import User from './User';
import Whisper from './Whisper';
import Vision from './Vision';
import PlaygroundTokens from './PlaygroundToken';

@Entity({ name: 'playgrounds' })
class Playground extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  threadId!: string;

  @ManyToOne(() => Workspace, (user) => user.playgrounds)
  @JoinColumn([{ name: 'workspace', referencedColumnName: 'id' }])
  workspace!: Workspace;

  @ManyToOne(() => User, (user) => user.playgrounds)
  @JoinColumn([{ name: 'user', referencedColumnName: 'id' }])
  user!: User;

  @OneToMany(() => PlaygroundTokens, (token) => token.playground)
  tokens!: PlaygroundTokens[];

  @OneToMany(() => Whisper, (token) => token.thread)
  whispers!: Whisper[];

  @OneToMany(() => Vision, (token) => token.thread)
  visions!: Vision[];

  // @Column({ type: 'enum', enum: ['ASSISTANT', 'USER'], default: 'ASSISTANT' })
  // responsible!: string;

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

