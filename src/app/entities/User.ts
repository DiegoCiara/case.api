import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import Access from './Access';
import Thread from './Thread';

@Entity({ name: 'users' })
class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  email!: string;

  @Column()
  customer_id!: string;


  @Column({ nullable: true })
  picture!: string;

  @Column()
  password_hash!: string;

  @Column({ nullable: true })
  token_reset_password!: string;

  @Column({ nullable: true, type: 'timestamp' })
  reset_password_expires!: Date;

  @Column({ nullable: true })
  secret!: string;

  @Column({ nullable: true })
  token_auth_secret!: string;

  @Column({ default: false })
  has_configured_2fa!: boolean;

  @OneToMany(() => Access, (access) => access.user)
  accesses!: Access[];

  @OneToMany(() => Thread, (workspace) => workspace.user)
  threads!: Thread[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date; // Modificação feita aqui para permitir valores nulos
}

export default User;

