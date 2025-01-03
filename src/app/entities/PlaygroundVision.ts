import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import Workspace from './Workspace';
import Thread from './Thread';
import Playground from './Playground';

@Entity({ name: 'playground_visions' })
class PlaygroundVision extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Workspace, (user) => user.playground_visions)
  @JoinColumn([{ name: 'workspace', referencedColumnName: 'id' }])
  workspace!: Workspace;

  @ManyToOne(() => Playground, (user) => user.playground_visions)
  @JoinColumn([{ name: 'playground', referencedColumnName: 'id' }])
  playground!: Playground;

  @Column()
  width!: string;

  @Column()
  height!: string; // total em Bytes

  @Column()
  model!: string; // total em Bytes

  @Column()
  type!: string; // total em Bytes

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date; // Modificação feita aqui para permitir valores nulos
}

export default PlaygroundVision;

