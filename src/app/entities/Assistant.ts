import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import Token from './Token';
import Thread from './Thread';
import Whisper from './Whisper';
import Vision from './Vision';
import Workspace from './Workspace';
import Message from './Message';
import Vector from './Vector';

@Entity({ name: 'assistants' })
class Assistant extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Workspace, (user) => user.assistants)
  @JoinColumn([{ name: 'workspace', referencedColumnName: 'id' }])
  workspace!: Workspace;

  @ManyToOne(() => Vector, (user) => user.assistants)
  @JoinColumn([{ name: 'vector', referencedColumnName: 'id' }])
  vector!: Vector;

  @OneToMany(() => Thread, (token) => token.assistant)
  threads!: Thread[];

  @OneToMany(() => Message, (token) => token.assistant)
  messages!: Message[];

  @OneToMany(() => Token, (token) => token.assistant)
  tokens!: Token[];

  @OneToMany(() => Vision, (token) => token.assistant)
  visions!: Vision[];

  @OneToMany(() => Whisper, (token) => token.assistant)
  whispers!: Whisper[];

  @Column()
  name!: string;

  @Column()
  model!: string;

  @Column()
  purpose!: string;

  @Column()
  openaiAssistantId!: string;

  @Column({ default: true })
  active!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date; // Modificação feita aqui para permitir valores nulos
}

export default Assistant;

