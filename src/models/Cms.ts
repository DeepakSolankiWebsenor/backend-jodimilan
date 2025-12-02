import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'cms', timestamps: true })
export class Cms extends Model {
  @Column({ type: DataType.BIGINT, primaryKey: true, autoIncrement: true })
  id!: number;

  @Column({ field: 'title', type: DataType.STRING(191), allowNull: false })
  title!: string;

  @Column({ field: 'slug', type: DataType.STRING(191), allowNull: false })
  slug!: string;

  @Column({ field: 'cms_type', type: DataType.STRING(191), allowNull: false })
  cmsType!: string;

  @Column({ field: 'description', type: DataType.TEXT, allowNull: true })
  description?: string;

  @Column({ field: 'meta_description', type: DataType.STRING(255), allowNull: true })
  metaDescription?: string;

  @Column({ field: 'meta_keywords', type: DataType.STRING(255), allowNull: true })
  metaKeywords?: string;

  @Column({ field: 'status', type: DataType.ENUM('Active', 'Inactive'), defaultValue: 'Active' })
  status!: string;
}
