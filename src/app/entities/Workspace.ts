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
import Access from './Access';
import Integration from './Integration';

@Entity({ name: 'workspaces' })
class Workspace extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  assistantPicture!: string;

  @Column()
  favicon!: string;

  @Column()
  logo!: string;

  @Column()
  logoDark!: string;

  @Column()
  colorTheme!: string;

  @Column()
  subscriptionId!: string;

  @Column()
  assistantId!: string;

  @Column()
  vectorId!: string;

  @OneToMany(() => Token, (token) => token.workspace)
  tokens!: Token[];

  @OneToMany(() => Access, (token) => token.workspace)
  accesses!: Access[];

  @OneToMany(() => Thread, (thread) => thread.workspace)
  threads!: Thread[];

  @OneToMany(() => Whisper, (notification) => notification.workspace)
  whispers!: Whisper[];

  @OneToMany(() => Integration, (notification) => notification.workspace)
  integrations!: Integration[];

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

