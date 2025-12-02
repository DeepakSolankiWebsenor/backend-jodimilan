import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'configs', timestamps: true })
export class Config extends Model {
  @Column({ type: DataType.BIGINT, primaryKey: true, autoIncrement: true })
  id!: number;

  @Column({ type: DataType.STRING(191), allowNull: false, unique: true })
  key!: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  value?: string;

  @Column({ type: DataType.STRING(191), allowNull: true })
  type?: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  description?: string;
}
