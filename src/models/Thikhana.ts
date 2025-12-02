import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'thikanas', timestamps: true, underscored: true })
export class Thikhana extends Model {
  @Column({ type: DataType.BIGINT, primaryKey: true, autoIncrement: true })
  id!: number;

  @Column({ type: DataType.STRING(191), allowNull: true })
  name?: string;

  @Column({ type: DataType.STRING(191), allowNull: true })
  state_id?: string;

  @Column({ type: DataType.STRING(191), allowNull: true })
  city_id?: string;

  @Column({ type: DataType.STRING(191), allowNull: true })
  area_id?: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  description?: string;

  @Column({ type: DataType.STRING(191), allowNull: true })
  image?: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  history?: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  present_clan?: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  personality?: string;
}
