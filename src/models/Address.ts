import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  ForeignKey,
  DeletedAt,
} from 'sequelize-typescript';
import { User } from './User';

@Table({
  tableName: 'addresses',
  timestamps: true,
  paranoid: true,
})
export class Address extends Model {
  @Column({
    type: DataType.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.BIGINT.UNSIGNED,
    allowNull: true,
  })
  user_id?: number;

  @Column({
    type: DataType.STRING(128),
    allowNull: true,
  })
  address_1?: string;

  @Column({
    type: DataType.STRING(128),
    allowNull: true,
  })
  address_2?: string;

  @Column({
    type: DataType.STRING(128),
    allowNull: true,
  })
  city?: string;

  @Column({
    type: DataType.STRING(128),
    allowNull: true,
  })
  state?: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: true,
  })
  postcode?: string;

  @Column({
    type: DataType.DECIMAL(11, 8),
    allowNull: true,
  })
  address_lat?: number;

  @Column({
    type: DataType.DECIMAL(11, 8),
    allowNull: true,
  })
  address_long?: number;

  @Column({
    type: DataType.CHAR(2),
    allowNull: true,
  })
  country_code?: string;

  @Column({
    type: DataType.TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '0-No,1-Yes',
  })
  is_default!: number;

  @Column({
    type: DataType.TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '0-No,1-Yes',
  })
  is_location!: number;

  @Column({
    type: DataType.STRING(10),
    allowNull: true,
    defaultValue: 'Active',
    comment: 'Active,Deleted,Inactive',
  })
  status?: string;

  @DeletedAt
  deleted_at?: Date;

  // Relationships
  @BelongsTo(() => User)
  user?: User;
}
