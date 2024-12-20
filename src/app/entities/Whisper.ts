import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import Workspace from './Workspace';
import Thread from './Thread';
import Assistant from './Assistant';

@Entity({ name: 'whispers' })
class Whisper extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Workspace, (user) => user.whispers)
  @JoinColumn([{ name: 'workspace', referencedColumnName: 'id' }])
  workspace!: Workspace;

  @ManyToOne(() => Assistant, (user) => user.whispers)
  @JoinColumn([{ name: 'assistant', referencedColumnName: 'id' }])
  assistant!: Assistant;

  @ManyToOne(() => Thread, (user) => user.whispers)
  @JoinColumn([{ name: 'thread', referencedColumnName: 'id' }])
  thread!: Thread;

  @Column()
  s3Location!: string;

  @Column()
  duration!: string; // total em Bytes

  @Column()
  output!: string; // total em Bytes

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date; // Modificação feita aqui para permitir valores nulos
}

export default Whisper;

