import { Table, Column, Model, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Session } from './Session';
import { User } from './User';

@Table({ tableName: 'chats', timestamps: true })
export class Chat extends Model {
  @Column({ type: DataType.BIGINT, primaryKey: true, autoIncrement: true })
  id!: number;

  @ForeignKey(() => Session)
  @Column({ type: DataType.BIGINT, allowNull: false })
  session_id!: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.BIGINT, allowNull: false })
  from_user_id!: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.BIGINT, allowNull: false })
  to_user_id!: number;

  @Column({ type: DataType.TEXT, allowNull: false })
  message!: string;

  @Column({ type: DataType.ENUM('text', 'image', 'file'), defaultValue: 'text' })
  message_type!: string;

  // Legacy field - kept for backward compatibility
  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  is_read!: boolean;

  // Enhanced status tracking
  @Column({ 
    type: DataType.ENUM('sending', 'sent', 'delivered', 'read', 'failed'), 
    defaultValue: 'sent',
    comment: 'Message delivery status'
  })
  status!: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

  @Column({ type: DataType.DATE, allowNull: true, comment: 'When message was delivered' })
  delivered_at?: Date;

  @Column({ type: DataType.DATE, allowNull: true, comment: 'When message was read' })
  read_at?: Date;

  // Reply functionality
  @ForeignKey(() => Chat)
  @Column({ type: DataType.BIGINT, allowNull: true, comment: 'ID of message being replied to' })
  reply_to?: number;

  // Soft delete per user
  @Column({ 
    type: DataType.JSON, 
    allowNull: true, 
    comment: 'User IDs who deleted this message: {user_id: true}' 
  })
  deleted_for?: Record<string, boolean>;

  @BelongsTo(() => Session)
  session!: Session;

  @BelongsTo(() => User, 'from_user_id')
  fromUser!: User;

  @BelongsTo(() => User, 'to_user_id')
  toUser!: User;

  @BelongsTo(() => Chat, 'reply_to')
  replyToMessage?: Chat;
}
