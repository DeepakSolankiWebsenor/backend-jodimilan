import { Table, Column, Model, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { User } from './User';

@Table({ tableName: 'friend_requests', timestamps: true })
export class FriendRequest extends Model {
  @Column({ type: DataType.BIGINT, primaryKey: true, autoIncrement: true })
  id!: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.BIGINT, allowNull: false, comment: 'User who sent the request' })
  user_id!: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.BIGINT, allowNull: false, comment: 'User who received the request' })
  request_profile_id!: number;

  @Column({ type: DataType.ENUM('Yes', 'No'), defaultValue: 'No' })
  status!: string;

  @BelongsTo(() => User, 'user_id')
  user!: User;

  @BelongsTo(() => User, 'request_profile_id')
  friend!: User;
}
