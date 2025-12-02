import { Table, Column, Model, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Order } from './Order';

@Table({ tableName: 'payment_orders', timestamps: true })
export class PaymentOrder extends Model {
  @Column({ type: DataType.BIGINT, primaryKey: true, autoIncrement: true })
  id!: number;

  @ForeignKey(() => Order)
  @Column({ type: DataType.BIGINT, allowNull: false })
  order_id!: number;

  @Column({ type: DataType.BIGINT, allowNull: true })
  paymentable_id?: number;

  @Column({ type: DataType.STRING(191), allowNull: true })
  payment_order_id?: string;

  @Column({ type: DataType.ENUM('Razorpay', 'Paypal', 'CCAvenue'), allowNull: false })
  payment_gateway_type!: string;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  amount!: number;

  @Column({ type: DataType.ENUM('Paid', 'Unpaid'), defaultValue: 'Unpaid' })
  status!: string;

  @Column({ type: DataType.STRING(191), allowNull: true })
  transaction_id?: string;

  @Column({ type: DataType.JSON, allowNull: true })
  payment_order_response?: any;

  @Column({ type: DataType.STRING(191), allowNull: true })
  ccavenue_order_status?: string;

  @BelongsTo(() => Order)
  order!: Order;
}
