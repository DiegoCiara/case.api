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
import Playground from './Playground';

@Entity({ name: 'playground_whispers' })
class PlaygroundWhisper extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Workspace, (user) => user.playground_whispers)
  @JoinColumn([{ name: 'workspace', referencedColumnName: 'id' }])
  workspace!: Workspace;

  @ManyToOne(() => Playground, (user) => user.playground_whispers)
  @JoinColumn([{ name: 'playground', referencedColumnName: 'id' }])
  playground!: Playground;

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

export default PlaygroundWhisper;

