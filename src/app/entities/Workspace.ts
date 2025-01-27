import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import Token from './Token';
import Thread from './Thread';
import Whisper from './Whisper';
import Vision from './Vision';
import Access from './Access';
import Integration from './Integration';
import Document from './Document';

@Entity({ name: 'workspaces' })
class Workspace extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  assistantId!: string;

  @Column()
  vectorId!: string;

  @Column()
  subscriptionId!: string;

  @Column({ nullable: true })
  assistantPicture!: string;

  @Column({ nullable: true })
  favicon!: string;

  @Column({ nullable: true })
  logo!: string;

  @Column({ nullable: true })
  logoDark!: string;

  @Column()
  colorTheme!: string;

  @OneToMany(() => Token, (token) => token.workspace)
  tokens!: Token[];

  @OneToMany(() => Access, (token) => token.workspace)
  accesses!: Access[];

  @OneToMany(() => Thread, (thread) => thread.workspace)
  threads!: Thread[];

  @OneToMany(() => Document, (thread) => thread.workspace)
  documents!: Document[];

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
