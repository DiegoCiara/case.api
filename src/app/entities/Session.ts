import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import User from './User';
import Workspace from './Workspace';
import Pipeline from './Pipeline';
import Assistant from './Assistant';
// ,
// "creditCard": {
//   "creditCardNumber": "8829",
//   "creditCardBrand": "MASTERCARD",
//   "creditCardToken": "a75a1d98-c52d-4a6b-a413-71e00b193c99"
// }
@Entity({ name: 'sessions' })
class Session extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Workspace, (user) => user.sessions)
  @JoinColumn([{ name: 'workspace', referencedColumnName: 'id' }])
  workspace!: Workspace;

  @OneToOne(() => Assistant, (user) => user.session)
  @JoinColumn([{ name: 'assistant', referencedColumnName: 'id' }])
  assistant!: Assistant;

  @Column({ nullable: true })
  token!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date;
}

export default Session;

