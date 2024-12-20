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
import File from './File';


@Entity({ name: 'vectors' })
class Vector extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  vectorId!: string;

  @Column()
  name!: string;

  @ManyToOne(() => Workspace, (token) => token.vectors)
  @JoinColumn([{ name: 'workspace', referencedColumnName: 'id' }])
  workspace!: Workspace;

  @OneToMany(() => File, (token) => token.vector)
  files!: File[];

  @OneToMany(() => Assistant, (token) => token.vector)
  assistants!: Assistant[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date;
}

export default Vector;

