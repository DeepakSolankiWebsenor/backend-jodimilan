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

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  is_read!: boolean;

  @BelongsTo(() => Session)
  session!: Session;

  @BelongsTo(() => User, 'from_user_id')
  fromUser!: User;

  @BelongsTo(() => User, 'to_user_id')
  toUser!: User;
}
