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
import Access from './Access';
import Thread from './Thread';
import Log from './Log';
import Playground from './Playground';

@Entity({ name: 'users' })
class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  email!: string;

  @Column()
  customerId!: string;

  @Column({ nullable: true, default: false })
  hasResetPass!: boolean;

  @Column()
  passwordHash!: string;

  @Column({ nullable: true })
  picture!: string;

  @Column({ default: true }) //30 minutos
  notifyEnabled!: boolean; //Tempo de espera para aassumir o whatsapp

  @OneToMany(() => Access, (access) => access.user)
  accesses!: Access[];

  @OneToMany(() => Playground, (workspace) => workspace.user)
  playgrounds!: Playground[];

  @OneToMany(() => Log, (workspace) => workspace.user)
  logs!: Log[];

  @Column({ nullable: true })
  passwordResetToken!: string;

  @Column({ nullable: true, type: 'timestamp' })
  passwordResetExpires!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date; // Modificação feita aqui para permitir valores nulos
}

export default User;

