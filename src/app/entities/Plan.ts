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
import User from './User';
import Workspace from './Workspace';
// ,
// "creditCard": {
//   "creditCardNumber": "8829",
//   "creditCardBrand": "MASTERCARD",
//   "creditCardToken": "a75a1d98-c52d-4a6b-a413-71e00b193c99"
// }
@Entity({ name: 'plans' })
class Plan extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToMany(() => Workspace, (token) => token.plan)
  workspaces!: Workspace[];

  @Column()
  name!: string;

  @Column()
  description!: string;

  @Column({ type: 'float' })
  value!: number;

  @Column({ default: true })
  aiService!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date; // Modificação feita aqui para permitir valores nulos
}

export default Plan;

