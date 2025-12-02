import { Table, Column, Model, DataType, BelongsTo, ForeignKey, HasMany } from 'sequelize-typescript';
import { Country } from './Country';
import { City } from './City';

@Table({ tableName: 'states', timestamps: true, underscored: true })
export class State extends Model {
  @Column({ type: DataType.BIGINT, primaryKey: true, autoIncrement: true })
  id!: number;

  @Column({ type: DataType.CHAR(2), allowNull: true })
  country_code?: string;

  @ForeignKey(() => Country)
  @Column({ type: DataType.STRING(255), allowNull: true })
  country_id?: string;

  @Column({ type: DataType.STRING(50), allowNull: true })
  name?: string;

  @BelongsTo(() => Country)
  country?: Country;

  @HasMany(() => City)
  cities!: City[];
}
