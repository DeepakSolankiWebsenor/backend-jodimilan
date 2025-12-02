import { Table, Column, Model, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { User } from './User';

@Table({ tableName: 'user_albums', timestamps: true })
export class UserAlbum extends Model {
  @Column({ type: DataType.BIGINT, primaryKey: true, autoIncrement: true })
  id!: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.BIGINT, allowNull: false })
  user_id!: number;

  @Column({ type: DataType.STRING(255), allowNull: true })
  images!: string;

  @BelongsTo(() => User)
  user!: User;
}
