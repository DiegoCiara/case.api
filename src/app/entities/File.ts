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
import Workspace from './Workspace';
import Assistant from './Assistant';
import Vector from './Vector';

@Entity({ name: 'files' })
class File extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({})
  fileId!: string;

  @Column()
  name!: string;

  @Column()
  link!: string;

  @ManyToOne(() => Workspace, (token) => token.files)
  @JoinColumn([{ name: 'workspace', referencedColumnName: 'id' }])
  workspace!: Workspace;

  @ManyToOne(() => Vector, (token) => token.files)
  @JoinColumn([{ name: 'vector', referencedColumnName: 'id' }])
  vector!: Vector;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date;
}

export default File;

