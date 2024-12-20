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
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import User from './User';
import Workspace from './Workspace';
// "creditCard": {
//   "creditCardNumber": "8829",
//   "creditCardBrand": "MASTERCARD",
//   "creditCardToken": "a75a1d98-c52d-4a6b-a413-71e00b193c99"
// }
@Entity({ name: 'accesses' })
class Access extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Workspace, (token) => token.accesses)
  @JoinColumn([{ name: 'workspace', referencedColumnName: 'id' }])
  workspace!: Workspace;

  @ManyToOne(() => User, (token) => token.accesses)
  @JoinColumn([{ name: 'user', referencedColumnName: 'id' }])
  user!: User;

  @Column({ type: 'enum', enum: ['OWNER','LEADER', 'ADMIN', 'SELLER', 'SUPPORT'], default: 'OWNER' })
  role!: string;

  @Column({ type: 'jsonb', default: { pages: [] } })
  permissions!: any;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date;
}

export default Access;

