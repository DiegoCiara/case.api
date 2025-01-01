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

@Entity({ name: 'threads' })
class Playground extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  threadId!: string;

  @ManyToOne(() => Workspace, (user) => user.threads)
  @JoinColumn([{ name: 'workspace', referencedColumnName: 'id' }])
  workspace!: Workspace;

  @ManyToOne(() => User, (user) => user.threads)
  @JoinColumn([{ name: 'user', referencedColumnName: 'id' }])
  user!: User;

  @OneToMany(() => Token, (token) => token.thread)
  tokens!: Token[];

  @OneToMany(() => Whisper, (token) => token.thread)
  whispers!: Whisper[];

  @OneToMany(() => Vision, (token) => token.thread)
  visions!: Vision[];

  // @Column({ type: 'enum', enum: ['ASSISTANT', 'USER'], default: 'ASSISTANT' })
  // responsible!: string;

  @Column()
  active!: boolean;

  @Column()
  usage!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date; // Modificação feita aqui para permitir valores nulos
}

export default Playground;

