import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
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
  name!: string;

  @Column()
  functionName!: string;

  @Column()
  description!: string;

  @ManyToOne(() => Workspace, (user) => user.integrations)
  @JoinColumn([{ name: 'workspace', referencedColumnName: 'id' }])
  workspace!: Workspace;

  @Column()
  url!: string;

  @Column({ type: 'enum', enum: ['GET', 'POST', 'PUT', 'PATCH']})
  method!: string;

  @Column({type: 'jsonb', nullable: true})
  body!: any[];

  @Column({type: 'jsonb', nullable: true})
  headers!: Headers[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date;
}

export default Integration;

