import { Table, Column, Model, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { User } from './User';
import { Package } from './Package';

@Table({ tableName: 'package_payments', timestamps: true })
export class PackagePayment extends Model {
  @Column({ type: DataType.BIGINT, primaryKey: true, autoIncrement: true })
  id!: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.BIGINT, allowNull: false })
  user_id!: number;

  @ForeignKey(() => Package)
  @Column({ type: DataType.BIGINT, allowNull: false })
  package_id!: number;

  @Column({ type: DataType.DATE, allowNull: false })
  start_date!: Date;

  @Column({ type: DataType.DATE, allowNull: false })
  end_date!: Date;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  amount!: number;

  @Column({ type: DataType.ENUM('Active', 'Expired'), defaultValue: 'Active' })
  status!: string;

  @BelongsTo(() => User)
  user!: User;

  @BelongsTo(() => Package)
  package!: Package;
}
