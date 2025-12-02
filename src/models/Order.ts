import { Table, Column, Model, DataType, BelongsTo, ForeignKey, DeletedAt,HasOne } from 'sequelize-typescript';
import { User } from './User';
import { Package } from './Package';
import { PaymentOrder } from './PaymentOrder';

@Table({ tableName: 'orders', timestamps: true, paranoid: true })
export class Order extends Model {
  
  @Column({ type: DataType.BIGINT, primaryKey: true, autoIncrement: true })
  id!: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.BIGINT, allowNull: false })
  user_id!: number;

  @ForeignKey(() => Package)
  @Column({ type: DataType.BIGINT, allowNull: true })
  package_id?: number;

  @Column({ type: DataType.STRING(191), allowNull: false, unique: true })
  order_number!: string;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  total!: number;

  @Column({ type: DataType.DECIMAL(10, 2), defaultValue: 0 })
  netamount!: number;

  @Column({ type: DataType.ENUM('Pending', 'Completed', 'Cancelled'), defaultValue: 'Pending' })
  status!: string;

  @Column({ type: DataType.ENUM('Paid', 'Unpaid', 'Pending'), defaultValue: 'Unpaid' })
  payment_status!: string;

  @Column({ type: DataType.STRING(191), allowNull: true })
  razorpay_order_id?: string;

  @Column({ type: DataType.STRING(191), allowNull: true })
  razorpay_payment_id?: string;

  @Column({ type: DataType.STRING(191), allowNull: true })
  razorpay_signature?: string;

  @DeletedAt
  deleted_at?: Date;

  @BelongsTo(() => User)
  user!: User;

  @BelongsTo(() => Package)
  package?: Package;


  @HasOne(() => PaymentOrder, { foreignKey: 'order_id', as: 'paymentOrder' })
paymentOrder?: PaymentOrder;
}
