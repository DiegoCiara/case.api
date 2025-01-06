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
import Workspace from './Workspace';


interface Headers {
  key: string;
  value: string
};

interface Body  {
  property: string;
  description: string;
  required: boolean;

}

@Entity({ name: 'integrations' })
class Integration extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string; // total em Bytes

  @Column()
  functionName!: string; // total em Bytes

  @Column()
  description!: string; // total em Bytes

  @ManyToOne(() => Workspace, (user) => user.integrations)
  @JoinColumn([{ name: 'workspace', referencedColumnName: 'id' }])
  workspace!: Workspace;

  @Column()
  url!: string;

  @Column({ type: 'enum', enum: ['GET', 'POST', 'PUT', 'PATCH']})
  method!: string;

  @Column({type: 'jsonb', nullable: true})
  body!: any[]; // total em Bytes

  @Column({type: 'jsonb', nullable: true})
  headers!: Headers[]; // total em Bytes

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date; // Modificação feita aqui para permitir valores nulos
}

export default Integration;

