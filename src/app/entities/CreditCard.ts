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
import Softspacer from './Softspacer';
// ,
  // "creditCard": {
  //   "creditCardNumber": "8829",
  //   "creditCardBrand": "MASTERCARD",
  //   "creditCardToken": "a75a1d98-c52d-4a6b-a413-71e00b193c99"
  // }
@Entity({ name: 'creditCards' })
class CreditCard extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Softspacer, (user) => user.creditCards)
  @JoinColumn([{ name: 'softspacer', referencedColumnName: 'id' }])
  softspacer!: Softspacer;

  @Column()
  creditCardNumber!: string;

  @Column()
  creditCardBrand!: string;

  @Column()
  creditCardToken!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date; // Modificação feita aqui para permitir valores nulos
}

export default CreditCard;
