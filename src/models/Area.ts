import { Table, Column, Model, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { City } from './City';

@Table({ tableName: 'areas', timestamps: true, underscored: true })
export class Area extends Model {
  @Column({ type: DataType.BIGINT, primaryKey: true, autoIncrement: true })
  id!: number;

  @Column({ type: DataType.STRING(191), allowNull: true })
  name?: string;

  @ForeignKey(() => City)
  @Column({ type: DataType.STRING(191), allowNull: true })
  city_id?: string;

  @Column({ type: DataType.STRING(191), allowNull: true })
  state_id?: string;

  @BelongsTo(() => City)
  city?: City;
}
