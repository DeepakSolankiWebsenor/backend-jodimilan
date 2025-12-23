import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from './User';

@Table({
  tableName: 'user_viewed_profiles',
  timestamps: true,
  underscored: true,
})
export class UserViewedProfile extends Model {
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  viewer_id!: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  viewed_id!: number;

  @BelongsTo(() => User, 'viewer_id')
  viewer!: User;

  @BelongsTo(() => User, 'viewed_id')
  viewed!: User;
}
