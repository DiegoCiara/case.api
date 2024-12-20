import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import Workspace from './Workspace';
import Group from './Group';
import Pipeline from './Pipeline';
import Commission from './Commission';
import Origin from './Origin';
import Thread from './Thread';
import Assistant from './Assistant';
import Profile from './Profile';

@Entity({ name: 'landingpages' })
class LandingPage extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Workspace, (user) => user.landingpages)
  @JoinColumn([{ name: 'workspace', referencedColumnName: 'id' }])
  workspace!: Workspace;

  @ManyToOne(() => Group, (user) => user.landingpages)
  @JoinColumn([{ name: 'group', referencedColumnName: 'id' }])
  group!: Group;

  @ManyToMany(() => Profile, (profile) => profile.landingpages)
  @JoinTable()
  profiles!: Profile[];

  @ManyToOne(() => Pipeline, (user) => user.landingpages)
  @JoinColumn([{ name: 'pipeline', referencedColumnName: 'id' }])
  pipeline!: Pipeline;

  @ManyToOne(() => Origin, (user) => user.landingpages)
  @JoinColumn([{ name: 'origin', referencedColumnName: 'id' }])
  origin!: Origin;

  @ManyToOne(() => Commission, (user) => user.landingpages, { nullable: true })
  @JoinColumn([{ name: 'commission', referencedColumnName: 'id' }])
  commission!: Commission;

  @ManyToOne(() => Assistant, (user) => user.landingpages, { nullable: true })
  @JoinColumn([{ name: 'assistant', referencedColumnName: 'id' }])
  assistant!: Assistant;

  @OneToMany(() => Thread, (token) => token.landingpage)
  threads!: Thread[];

  @Column()
  name!: string;

  @Column({ default: false })
  hasFollowUp!: boolean;

  @Column({ type: 'float', nullable: true })
  initialPricing!: number;

  @Column({ nullable: true })
  redirectTo!: string;

  @Column({ nullable: true })
  assistantInstructions!: string;

  @Column({ default: false })
  enableCustomerSelectProfile!: boolean;

  @Column({ default: 'wpp' })
  followUpType!: string;

  @Column()
  domain!: string;

  @Column({ default: true })
  active!: boolean; //Texto retornado pela ia

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date; // Modificação feita aqui para permitir valores nulos
}

export default LandingPage;

