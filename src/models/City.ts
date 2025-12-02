import { Table, Column, Model, DataType, BelongsTo, ForeignKey, HasMany } from 'sequelize-typescript';
import { State } from './State';
import { Area } from './Area';

@Table({ tableName: 'cities', timestamps: true, underscored: true })
export class City extends Model {
  @Column({ type: DataType.BIGINT, primaryKey: true, autoIncrement: true })
  id!: number;

  @Column({ type: DataType.STRING(191), allowNull: true })
  country_id?: string;

  @ForeignKey(() => State)
  @Column({ type: DataType.STRING(191), allowNull: true })
  state_id?: string;

  @Column({ type: DataType.STRING(191), allowNull: true })
  name?: string;

  @Column({ type: DataType.STRING(200), allowNull: true })
  hindi_name?: string;

  @BelongsTo(() => State)
  state?: State;

  @HasMany(() => Area)
  areas!: Area[];
}
