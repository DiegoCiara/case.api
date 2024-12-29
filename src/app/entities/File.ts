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

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date;
}

export default File;

