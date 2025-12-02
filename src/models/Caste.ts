import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'castes', timestamps: true, underscored: true })
export class Caste extends Model {
  @Column({ type: DataType.BIGINT, primaryKey: true, autoIncrement: true })
  id!: number;

  @Column({ type: DataType.STRING(191), allowNull: true })
  name!: string;

  // Note: castes table doesn't have religion_id in actual database
}
