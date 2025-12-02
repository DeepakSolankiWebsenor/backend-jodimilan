import { Table, Column, Model, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { User } from './User';

@Table({ tableName: 'block_profiles', timestamps: true })
export class BlockProfile extends Model {
  @Column({ type: DataType.BIGINT, primaryKey: true, autoIncrement: true })
  id!: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.BIGINT, allowNull: false })
  user_id!: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.BIGINT, allowNull: false })
  block_profile_id!: number;

  @Column({ type: DataType.ENUM('Yes', 'No'), defaultValue: 'Yes' })
  status!: string;

  @BelongsTo(() => User, 'user_id')
  user!: User;

  @BelongsTo(() => User, 'block_profile_id')
  blockedUser!: User;
}
