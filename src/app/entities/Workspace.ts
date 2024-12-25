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
import Plan from './Plan';
import Message from './Message';
import Notification from './Notification';
import Task from './Task';
import File from './File';
import Whisper from './Whisper';
import Vision from './Vision';
import Assistant from './Assistant';
import Vector from './Vector';
import CreditCard from './CreditCard';
import Pipeline from './Pipeline';
import Access from './Access';

@Entity({ name: 'workspaces' })
class Workspace extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true })
  openaiApiKey!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  picture!: string;

  @Column()
  subscriptionId!: string;

  @Column()
  customerId!: string;

  @Column()
  color!: string;

  @Column({ type: 'jsonb', nullable: true })
  pageLabels!: string;

  @Column({ type: 'int', default: 100 })
  s3!: number;

  @OneToMany(() => CreditCard, (card) => card.workspace)
  creditCards!: CreditCard[];

  @OneToMany(() => Assistant, (access) => access.workspace)
  assistants!: Assistant[];

  @ManyToOne(() => Plan, (workspace) => workspace.workspaces)
  @JoinColumn([{ name: 'plan', referencedColumnName: 'id' }])
  plan!: Plan;

  @OneToMany(() => File, (document) => document.workspace)
  files!: File[];

  @OneToMany(() => Message, (message) => message.workspace)
  messages!: Message[];

  @OneToMany(() => Token, (token) => token.workspace)
  tokens!: Token[];

  @OneToMany(() => Access, (token) => token.workspace)
  accesses!: Access[];

  @OneToMany(() => Thread, (thread) => thread.workspace)
  threads!: Thread[];

  @OneToMany(() => Pipeline, (token) => token.workspace)
  pipelines!: Pipeline[];

  @OneToMany(() => Task, (credit) => credit.workspace)
  tasks!: Task[];

  @OneToMany(() => Vector, (credit) => credit.workspace)
  vectors!: Vector[];

  @OneToMany(() => Notification, (notification) => notification.workspace)
  notifications!: Notification[];

  @OneToMany(() => Whisper, (notification) => notification.workspace)
  whispers!: Whisper[];

  @OneToMany(() => Vision, (notification) => notification.workspace)
  visions!: Vision[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date; // Modificação feita aqui para permitir valores nulos
}

export default Workspace;

