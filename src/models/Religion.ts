import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'religions', timestamps: true, underscored: true })
export class Religion extends Model {
  @Column({ type: DataType.BIGINT, primaryKey: true, autoIncrement: true })
  id!: number;

  @Column({ type: DataType.STRING(191), allowNull: true })
  name!: string;

  // Note: No relationship with castes as castes table doesn't have religion_id
}
