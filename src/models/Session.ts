import { Table, Column, Model, DataType, BelongsTo, ForeignKey, HasMany } from 'sequelize-typescript';
import { User } from './User';
import { Chat } from './Chat';

@Table({ tableName: 'sessions', timestamps: true })
export class Session extends Model {
  @Column({ type: DataType.BIGINT, primaryKey: true, autoIncrement: true })
  id!: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.BIGINT, allowNull: false })
  user1_id!: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.BIGINT, allowNull: false })
  user2_id!: number;

  @Column({ type: DataType.JSON, allowNull: true, comment: 'Block data {user_id: true/false}' })
  block?: any;

  @BelongsTo(() => User, 'user1_id')
  user1!: User;

  @BelongsTo(() => User, 'user2_id')
  user2!: User;

  @HasMany(() => Chat)
  chats!: Chat[];
}
