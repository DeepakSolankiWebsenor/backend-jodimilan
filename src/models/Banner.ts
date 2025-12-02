import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'banners', timestamps: true, underscored: true, paranoid: true })
export class Banner extends Model {
  @Column({ type: DataType.BIGINT, primaryKey: true, autoIncrement: true })
  id!: number;

  @Column({ type: DataType.STRING(191), allowNull: true })
  title?: string;

  @Column({ type: DataType.INTEGER, allowNull: true })
  category_id?: number;

  @Column({ type: DataType.ENUM('app', 'web', 'both'), allowNull: false })
  type!: string;

  @Column({ type: DataType.STRING(191), allowNull: false })
  layout!: string;

  @Column({ type: DataType.INTEGER, allowNull: true })
  sort?: number;

  @Column({ type: DataType.STRING(191), allowNull: false })
  status!: string;

  @Column({ type: DataType.STRING(191), allowNull: true })
  image_type?: string;

  @Column({ type: DataType.DATE, allowNull: true, field: 'deleted_at' })
  deletedAt?: Date;
}
