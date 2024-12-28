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
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import User from './User';

@Entity({ name: 'logs' })
class Log extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  table!: string;

  @Column()
  status!: string;

  @Column()
  operation!: string;

  @Column()
  data!: string;

  @Column({ type: 'jsonb', nullable: true })
  target!: string;

  @ManyToOne(() => User, (user) => user.logs)
  @JoinColumn([{ name: 'user', referencedColumnName: 'id' }])
  user!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date; // Modificação feita aqui para permitir valores nulos
}

export default Log;

