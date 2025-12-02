import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'packages', timestamps: true, underscored: true })
export class Package extends Model {
  @Column({ type: DataType.BIGINT, primaryKey: true, autoIncrement: true })
  id!: number;

  @Column({ type: DataType.STRING(191), allowNull: false })
  package_title!: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  package_feature?: string;

  @Column({ type: DataType.STRING(191), allowNull: false })
  package_price!: string;

  @Column({ type: DataType.STRING(191), allowNull: false })
  package_duration!: string;

  @Column({ type: DataType.STRING(191), allowNull: false })
  total_profile_view!: string;

  @Column({ type: DataType.STRING(20), defaultValue: 'Active' })
  status!: string;

  @Column({ type: DataType.STRING(191), allowNull: true })
  image?: string;
}
