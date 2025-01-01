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
import Workspace from './Workspace';

@Entity({ name: 'customers' })
class Customer extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  email!: string;
  @Column({ nullable: true, default: false })
  hasResetPass!: boolean;

  @Column()
  passwordHash!: string;

  @Column({ nullable: true })
  picture!: string;

  @Column({ default: true }) //30 minutos
  notifyEnabled!: boolean; //Tempo de espera para aassumir o whatsapp

  @OneToMany(() => Thread, (workspace) => workspace.customer)
  threads!: Thread[];

  @ManyToOne(() => Workspace, (token) => token.customers)
  @JoinColumn([{ name: 'workspace', referencedColumnName: 'id' }])
  workspace!: Workspace;

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

export default Customer;

