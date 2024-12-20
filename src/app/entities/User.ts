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
import CreditCard from './CreditCard';
import Message from './Message';
import Access from './Access';
import Task from './Task';
import Notification from './Notification';
import Thread from './Thread';
import Log from './Log';

@Entity({ name: 'users' })
class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  email!: string;

  @Column({ nullable: true, default: false })
  hasResetPass!: boolean;

  @Column()
  passwordHash!: string;

  @Column({ nullable: true })
  picture!: string;

  @Column({ default: true }) //30 minutos
  notifyEnabled!: boolean; //Tempo de espera para aassumir o whatsapp

  @OneToMany(() => Message, (message) => message.user)
  messages!: Message[];

  @OneToMany(() => Access, (access) => access.user)
  accesses!: Access[];

  @OneToMany(() => Thread, (workspace) => workspace.user)
  threads!: Thread[];

  @OneToMany(() => Notification, (workspace) => workspace.user)
  notifications!: Notification[];

  @OneToMany(() => Log, (workspace) => workspace.user)
  logs!: Log[];

  @OneToMany(() => Task, (workspace) => workspace.user)
  tasks!: Task[];

  @Column({ nullable: true })
  passwordResetToken!: string;

  @Column({ nullable: true, type: 'timestamp' })
  passwordResetExpires!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date; // Modificação feita aqui para permitir valores nulos
}

export default User;

