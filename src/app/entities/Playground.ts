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
import User from './User';
import PlaygroundTokens from './PlaygroundToken';
import PlaygroundVision from './PlaygroundVision';
import PlaygroundWhisper from './PlaygroundWhisper';

@Entity({ name: 'playgrounds' })
class Playground extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  threadId!: string;

  @Column()
  name!: string;

  @ManyToOne(() => Workspace, (user) => user.playgrounds)
  @JoinColumn([{ name: 'workspace', referencedColumnName: 'id' }])
  workspace!: Workspace;

  @ManyToOne(() => User, (user) => user.playgrounds)
  @JoinColumn([{ name: 'user', referencedColumnName: 'id' }])
  user!: User;

  @OneToMany(() => PlaygroundTokens, (token) => token.playground)
  tokens!: PlaygroundTokens[];

  @OneToMany(() => PlaygroundWhisper, (token) => token.playground)
  playground_whispers!: PlaygroundWhisper[];

  @OneToMany(() => PlaygroundVision, (token) => token.playground )
  playground_visions!: PlaygroundVision[];

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

