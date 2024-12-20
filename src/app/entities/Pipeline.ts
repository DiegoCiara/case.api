import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import Task from './Task';
import Workspace from './Workspace';
// ,
// "creditCard": {
//   "creditCardNumber": "8829",
//   "creditCardBrand": "MASTERCARD",
//   "creditCardToken": "a75a1d98-c52d-4a6b-a413-71e00b193c99"
// }
@Entity({ name: 'pipelines' })
class Pipeline extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Workspace, (token) => token.pipelines)
  @JoinColumn([{ name: 'workspace', referencedColumnName: 'id' }])
  workspace!: Workspace;

  @OneToMany(() => Task, (token) => token.pipeline)
  tasks!: Task[];

  @Column()
  name!: string;

  @Column({ nullable: true })
  description!: string;

  @Column()
  color!: string;

  @Column({ type: 'int' })
  position!: number;

  @Column({ default: true })
  active!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date;
}

export default Pipeline;

