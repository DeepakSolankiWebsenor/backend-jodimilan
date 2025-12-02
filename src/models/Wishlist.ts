import { Table, Column, Model, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { User } from './User';

@Table({ tableName: 'wishlists', timestamps: true })
export class Wishlist extends Model {
  @Column({ type: DataType.BIGINT, primaryKey: true, autoIncrement: true })
  id!: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.BIGINT, allowNull: false })
  user_id!: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.BIGINT, allowNull: false })
  user_profile_id!: number;

  @BelongsTo(() => User, 'user_id')
  user!: User;

  @BelongsTo(() => User, 'user_profile_id')
  profileUser!: User;
}
