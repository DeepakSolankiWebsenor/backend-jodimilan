import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Caste } from './Caste';

@Table({
  tableName: 'clans',
  timestamps: true,
})
export class Clan extends Model<Clan> {
  @Column({
    type: DataType.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  })
  id!: number;

  @Column({
    type: DataType.STRING(191),
    allowNull: false,
  })
  name!: string;

  @ForeignKey(() => Caste)
  @Column({
    type: DataType.BIGINT.UNSIGNED,
    allowNull: false,
  })
  caste_id!: number;

  @BelongsTo(() => Caste)
  caste!: Caste;
}
