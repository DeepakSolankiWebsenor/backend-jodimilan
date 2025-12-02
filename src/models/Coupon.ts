import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'coupons', timestamps: true })
export class Coupon extends Model {
  @Column({ type: DataType.BIGINT, primaryKey: true, autoIncrement: true })
  id!: number;

  @Column({ type: DataType.STRING(191), allowNull: false, unique: true })
  code!: string;

  @Column({ type: DataType.STRING(191), allowNull: true })
  name?: string;

  @Column({ type: DataType.ENUM('percentage', 'fixed'), allowNull: false })
  discount_type!: string;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  discount_value!: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: true })
  min_purchase_amount?: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: true })
  max_discount_amount?: number;

  @Column({ type: DataType.DATE, allowNull: true })
  valid_from?: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  valid_to?: Date;

  @Column({ type: DataType.INTEGER, allowNull: true })
  usage_limit?: number;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  used_count!: number;

  @Column({ type: DataType.ENUM('Active', 'Inactive'), defaultValue: 'Active' })
  status!: string;
}
