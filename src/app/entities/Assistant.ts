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
import Action from './Action';
import Whisper from './Whisper';
import Vision from './Vision';
import Workspace from './Workspace';
import Session from './Session';
import Message from './Message';
import File from './File';
import Vector from './Vector';
import LandingPage from './LandingPage';
import Funnel from './Funnel';
import Playground from './Playground';

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

  @OneToOne(() => Session, (session) => session.assistant)
  session!: Session;

  @OneToMany(() => Thread, (token) => token.assistant)
  threads!: Thread[];

  @OneToMany(() => Playground, (token) => token.assistant)
  playgrounds!: Playground[];

  @OneToMany(() => Message, (token) => token.assistant)
  messages!: Message[];

  @OneToMany(() => Token, (token) => token.assistant)
  tokens!: Token[];

  @OneToMany(() => Vision, (token) => token.assistant)
  visions!: Vision[];

  @OneToMany(() => Whisper, (token) => token.assistant)
  whispers!: Whisper[];

  @OneToMany(() => Action, (token) => token.assistant)
  actions!: Action[];

  @OneToMany(() => LandingPage, (token) => token.assistant)
  landingpages!: LandingPage[];

  @ManyToMany(() => Funnel, (deal) => deal.assistants)
  @JoinTable()
  funnels!: Funnel[];

  @Column()
  name!: string;

  @Column()
  model!: string;

  @Column()
  purpose!: string;

  @Column()
  openaiAssistantId!: string;

  @Column({ default: false })
  wppEnabled!: boolean;

  @Column({ type: 'int', default: 20 }) //30 minutos
  wppDelayResponse!: number; //Tempo de espera para aassumir o whatsapp

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

