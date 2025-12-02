import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'categories', timestamps: true })
export class Category extends Model {
  @Column({ type: DataType.BIGINT, primaryKey: true, autoIncrement: true })
  id!: number;

  @Column({ type: DataType.STRING(191), allowNull: false })
  name!: string;

  @Column({ type: DataType.STRING(191), allowNull: true })
  slug?: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  description?: string;

  @Column({ type: DataType.STRING(255), allowNull: true })
  image?: string;

  @Column({ type: DataType.ENUM('Active', 'Inactive'), defaultValue: 'Active' })
  status!: string;
}
