import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'settings', timestamps: true, underscored: true })
export class Setting extends Model {
  @Column({ type: DataType.BIGINT, primaryKey: true, autoIncrement: true })
  id!: number;

  @Column({ type: DataType.STRING(191), allowNull: true })
  company_name?: string;

  @Column({ type: DataType.STRING(191), allowNull: true })
  company_email?: string;

  @Column({ type: DataType.STRING(191), allowNull: true })
  company_phone?: string;

  @Column({ type: DataType.STRING(191), allowNull: true })
  company_gst_no?: string;

  @Column({ type: DataType.STRING(191), allowNull: true })
  company_address?: string;

  @Column({ type: DataType.DECIMAL(10, 2), defaultValue: 0 })
  vendor_radius!: number;

  @Column({ type: DataType.DECIMAL(5, 2), defaultValue: 0 })
  percent_tax!: number;

  @Column({ type: DataType.DECIMAL(5, 2), defaultValue: 0 })
  percent_commission_admin!: number;

  @Column({ type: DataType.DECIMAL(5, 2), defaultValue: 0 })
  percent_commission_vendor!: number;

  @Column({ type: DataType.STRING(191), allowNull: true })
  prefix_id?: string;
}
