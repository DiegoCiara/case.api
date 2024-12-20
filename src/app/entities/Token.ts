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
import Assistant from './Assistant';

@Entity({ name: 'tokens' })
class Token extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Workspace, (user) => user.tokens)
  @JoinColumn([{ name: 'workspace', referencedColumnName: 'id' }])
  workspace!: Workspace;

  @ManyToOne(() => Assistant, (user) => user.tokens)
  @JoinColumn([{ name: 'assistant', referencedColumnName: 'id' }])
  assistant!: Assistant;

  @ManyToOne(() => Thread, (user) => user.tokens)
  @JoinColumn([{ name: 'thread', referencedColumnName: 'id' }])
  thread!: Thread;

  @Column()
  total_tokens!: number;

  @Column()
  completion_tokens!: number;

  @Column()
  prompt_tokens!: number;

  @Column({ nullable: true })
  output!: string;

  @Column({ nullable: true, type: 'jsonb' })
  input!: string;

  @Column()
  model!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date; // Modificação feita aqui para permitir valores nulos
}

export default Token;

