import { Table, Column, Model, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { User } from './User';

@Table({ tableName: 'user_presence', timestamps: true })
export class UserPresence extends Model {
  @Column({ type: DataType.BIGINT, primaryKey: true, autoIncrement: true })
  id!: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.BIGINT, allowNull: false, unique: true })
  user_id!: number;

  @Column({ type: DataType.BOOLEAN, defaultValue: false, comment: 'Is user currently online' })
  is_online!: boolean;

  @Column({ type: DataType.DATE, allowNull: true, comment: 'Last time user was seen online' })
  last_seen?: Date;

  @Column({ type: DataType.STRING, allowNull: true, comment: 'Current socket connection ID' })
  socket_id?: string;

  @BelongsTo(() => User)
  user!: User;
}
