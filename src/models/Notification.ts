import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'notifications', timestamps: true })
export class Notification extends Model {

  @Column({
    type: DataType.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  })
  id!: number;

  @Column({ type: DataType.STRING(191), allowNull: false })
  type!: string;

  @Column({ type: DataType.STRING(191), allowNull: false })
  notifiable_type!: string;

  @Column({ type: DataType.BIGINT, allowNull: false }) 
  notifiable_id!: number; // use BIGINT to match FriendRequest.id

  @Column({ type: DataType.TEXT, allowNull: false })
  data!: string;

  @Column({ type: DataType.DATE, allowNull: true })
  read_at!: Date | null;

  @Column({ type: DataType.BIGINT, allowNull: false })
  user_id!: number;
}
