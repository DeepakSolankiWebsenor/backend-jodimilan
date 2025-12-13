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

 @Column({
  type: DataType.JSON,
  allowNull: true,
  defaultValue: {}
})
block?: any;


  // Last message tracking for chat list preview
  @ForeignKey(() => Chat)
  @Column({ type: DataType.BIGINT, allowNull: true, comment: 'ID of last message in session' })
  last_message_id?: number;

  @Column({ type: DataType.DATE, allowNull: true, comment: 'Timestamp of last message' })
  last_message_at?: Date;

  // Typing indicators
  @Column({ 
    type: DataType.JSON, 
    allowNull: true, 
    comment: 'Users currently typing: {user_id: timestamp}' 
  })
  typing_users?: Record<string, number>;

  @BelongsTo(() => User, 'user1_id')
  user1!: User;

  @BelongsTo(() => User, 'user2_id')
  user2!: User;

  @HasMany(() => Chat)
  chats!: Chat[];

  @BelongsTo(() => Chat, 'last_message_id')
  lastMessage?: Chat;
}
