import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import User from './User';
import Workspace from './Workspace';
import Thread from './Thread';
import Token from './Token';
import Message from './Message';
import Assistant from './Assistant';
import Playground from './Playground';

@Entity({ name: 'actions' })
class Action extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Workspace, (user) => user.actions)
  @JoinColumn([{ name: 'workspace', referencedColumnName: 'id' }])
  workspace!: Workspace;

  @ManyToOne(() => Assistant, (user) => user.actions)
  @JoinColumn([{ name: 'assistant', referencedColumnName: 'id' }])
  assistant!: Assistant;

  @ManyToOne(() => Thread, (user) => user.actions)
  @JoinColumn([{ name: 'thread', referencedColumnName: 'id' }])
  thread!: Thread;
  
  @Column({ type: 'enum', enum: ['COMPLETED', 'FAILED'], default: 'COMPLETED' })
  status!: string; //Verificando se foi ou não possível criar a action

  @Column()
  command!: string; // comando executado

  @Column({ type: 'jsonb', nullable: true })
  arguments!: any; //Texto retornado pela ia

  @Column({ type: 'jsonb' })
  output!: any;

  @Column()
  callId!: string; //tool_call_id

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date; // Modificação feita aqui para permitir valores nulos
}

export default Action;

