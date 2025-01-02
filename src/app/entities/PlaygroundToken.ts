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
import Playground from './Playground';

@Entity({ name: 'playgroundTokens' })
class PlaygroundTokens extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Workspace, (user) => user.tokens)
  @JoinColumn([{ name: 'workspace', referencedColumnName: 'id' }])
  workspace!: Workspace;

  @ManyToOne(() => Playground, (user) => user.tokens)
  @JoinColumn([{ name: 'playground', referencedColumnName: 'id' }])
  playground!: Playground;

  @Column()
  total_tokens!: number;

  @Column()
  completion_tokens!: number;

  @Column()
  prompt_tokens!: number;

  @Column({ type: 'jsonb' })
  output!: string;

  @Column({ type: 'jsonb' })
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

export default PlaygroundTokens;

