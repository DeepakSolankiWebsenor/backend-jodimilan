import {
  Table,
  Column,
  Model,
  DataType,
  HasOne,
  BelongsTo,
  ForeignKey,
  HasMany,
  DeletedAt,
} from 'sequelize-typescript';
import { UserProfile } from './UserProfile';
import { Country } from './Country';
import { State } from './State';
import { Religion } from './Religion';
import { Caste } from './Caste';
import { Package } from './Package';
import { UserAlbum } from './UserAlbum';
import { BlockProfile } from './BlockProfile';
import { PackagePayment } from './PackagePayment';
import { Address } from './Address';
import { Cart } from './Cart';


@Table({
  tableName: 'users',
  timestamps: true,
  paranoid: true,
})
export class User extends Model {
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @Column({
    type: DataType.STRING(191),
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.STRING(191),
    allowNull: true,
  })
  last_name?: string;

  @Column({
    type: DataType.STRING(191),
    allowNull: false,
    unique: true,
  })
  email!: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  email_verified_at?: Date;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  password!: string;

  @Column({
    type: DataType.STRING(10),
    allowNull: false,
  })
  phone!: string;

  @Column({
    type: DataType.STRING(10),
    allowNull: false,
  })
  dialing_code!: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_phone_verified!: boolean;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    unique: true,
  })
  ryt_id?: string;

  @Column({
    type: DataType.ENUM('Self', 'Parents', 'Friends', 'Guardian', 'Sibling'),
    allowNull: false,
  })
  profile_by!: string;

  @Column({
    type: DataType.ENUM('Male', 'Female'),
    allowNull: false,
  })
  gender!: string;

  @Column({
    type: DataType.ENUM('Unmarried', 'Widow/Widower', 'Divorcee', 'Seperated', 'Awaiting Divorce'),
    allowNull: false,
  })
  mat_status!: string;

  @ForeignKey(() => Religion)
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  religion!: number;

  @ForeignKey(() => Caste)
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  caste!: number;

  @ForeignKey(() => Country)
  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  country?: number;

  @ForeignKey(() => State)
  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  state?: number;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
  })
  dob!: Date;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  age?: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  profile_photo?: string;

  @Column({
    type: DataType.ENUM('Active', 'Deleted', 'Inactive', 'Not Verified'),
    defaultValue: 'Not Verified',
  })
  status!: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
  })
  user_type?: string;

  @ForeignKey(() => Package)
  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  package_id?: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  package_expiry?: Date;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  total_profile_view_count!: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  profile_visit!: number;

  @Column({
    type: DataType.STRING(6),
    allowNull: true,
  })
  otp?: string | null;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  otp_expiry?: Date | null;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  otp_attempts!: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  otp_last_sent?: Date | null;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  partner_preferences?: any;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  delete_account_reason?: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  user_password?: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  notification_status!: boolean;

  @DeletedAt
  deleted_at?: Date;

  // Relationships
  @HasOne(() => UserProfile)
  profile!: UserProfile;

  @BelongsTo(() => Country)
  countryRelation?: Country;

  @BelongsTo(() => State)
  stateRelation?: State;

  @BelongsTo(() => Religion)
  religionRelation?: Religion;

  @BelongsTo(() => Caste)
  casteRelation?: Caste;

  @BelongsTo(() => Package)
  package?: Package;

  @HasMany(() => UserAlbum)
  albums!: UserAlbum[];

  @HasMany(() => BlockProfile)
  blockedProfiles!: BlockProfile[];

  @HasOne(() => PackagePayment)
  packagePayment?: PackagePayment;

  @HasMany(() => Address)
  addresses!: Address[];

  @HasMany(() => Cart)
  carts!: Cart[];
}
