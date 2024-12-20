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
import User from './User';
import Token from './Token';
import Thread from './Thread';
import Plan from './Plan';
import Funnel from './Funnel';
import Contact from './Contact';
import Access from './Access';
import Deal from './Deal';
import Message from './Message';
import Action from './Action';
import Notification from './Notification';
import Task from './Task';
import Product from './Product';
import Customer from './Customer';
import Session from './Session';
import File from './File';
import Document from './Document';
import Group from './Group';
import Bank from './Bank';
import Partner from './Partner';
import Commission from './Commission';
import Sale from './Sale';
import Goal from './Goal';
import Whisper from './Whisper';
import Vision from './Vision';
import Origin from './Origin';
import LandingPage from './LandingPage';
import Assistant from './Assistant';
import Vector from './Vector';
import Softspacer from './Softspacer';
import Profile from './Profile';
import Playground from './Playground';
import PlaygroundMessage from './PlaygroundMessage';

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

  @Column({ nullable: true })
  subscriptionAsaasId!: string;

  @Column()
  color!: string;

  @Column({ type: 'jsonb', nullable: true })
  pageLabels!: string;

  @Column({ type: 'int', default: 100 })
  s3!: number;

  @Column()
  companyType!: string;

  @Column({ nullable: true })
  apiKey!: string;

  @OneToMany(() => Session, (session) => session.workspace)
  sessions!: Session[];

  @ManyToOne(() => Softspacer, (user) => user.owners, { nullable: true })
  @JoinColumn([{ name: 'softspacer', referencedColumnName: 'id' }])
  softspacer!: Softspacer;

  @OneToMany(() => Assistant, (access) => access.workspace)
  assistants!: Assistant[];

  @OneToMany(() => Access, (access) => access.workspace)
  accesses!: Access[];

  @OneToMany(() => Playground, (access) => access.workspace)
  playgrounds!: Playground[];

  @ManyToOne(() => Plan, (workspace) => workspace.workspaces)
  @JoinColumn([{ name: 'plan', referencedColumnName: 'id' }])
  plan!: Plan;

  @OneToMany(() => Deal, (deal) => deal.workspace)
  deals!: Deal[];

  @OneToMany(() => File, (document) => document.workspace)
  files!: File[];

  @OneToMany(() => Origin, (document) => document.workspace)
  origins!: Origin[];

  @OneToMany(() => LandingPage, (document) => document.workspace)
  landingpages!: LandingPage[];

  @OneToMany(() => Document, (document) => document.workspace)
  documents!: Document[];

  @OneToMany(() => Customer, (customer) => customer.workspace)
  customers!: Customer[];

  @OneToMany(() => Group, (customer) => customer.workspace)
  groups!: Group[];

  @OneToMany(() => Profile, (customer) => customer.workspace)
  profiles!: Profile[];

  @OneToMany(() => Message, (message) => message.workspace)
  messages!: Message[];

  @OneToMany(() => PlaygroundMessage, (message) => message.workspace)
  playgroundmessages!: PlaygroundMessage[];

  @OneToMany(() => Token, (token) => token.workspace)
  tokens!: Token[];

  @OneToMany(() => Thread, (thread) => thread.workspace)
  threads!: Thread[];

  @OneToMany(() => Funnel, (funnel) => funnel.workspace)
  funnels!: Funnel[];

  @OneToMany(() => Product, (product) => product.workspace)
  products!: Product[];

  @OneToMany(() => Contact, (contact) => contact.workspace)
  contacts!: Contact[];

  @OneToMany(() => Action, (action) => action.workspace)
  actions!: Action[];

  @OneToMany(() => Task, (credit) => credit.workspace)
  tasks!: Task[];

  @OneToMany(() => Bank, (credit) => credit.workspace)
  banks!: Bank[];

  @OneToMany(() => Partner, (credit) => credit.workspace)
  partners!: Partner[];

  @OneToMany(() => Commission, (credit) => credit.workspace)
  commissions!: Commission[];

  @OneToMany(() => Vector, (credit) => credit.workspace)
  vectors!: Vector[];

  @OneToMany(() => Goal, (credit) => credit.workspace)
  goals!: Goal[];

  @OneToMany(() => Sale, (credit) => credit.workspace)
  sales!: Sale[];

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

