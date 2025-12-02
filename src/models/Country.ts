import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { State } from './State';

@Table({ tableName: 'countries', timestamps: true, underscored: true })
export class Country extends Model {
  @Column({ type: DataType.BIGINT, primaryKey: true, autoIncrement: true })
  id!: number;

  @Column({ type: DataType.CHAR(2), allowNull: true })
  code?: string;

  @Column({ type: DataType.CHAR(3), allowNull: true })
  code_iso?: string;

  @Column({ type: DataType.STRING(50), allowNull: true })
  name?: string;

  @Column({ type: DataType.STRING(50), allowNull: true })
  capital_name?: string;

  @Column({ type: DataType.STRING(10), allowNull: true })
  dialing_code?: string;

  @HasMany(() => State)
  states!: State[];
}
