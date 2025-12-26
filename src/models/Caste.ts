import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { Religion } from './Religion';
import { Clan } from './Clan';

@Table({
  tableName: 'castes',
  timestamps: true,
  underscored: true,
})
export class Caste extends Model<Caste> {
  @Column({
    type: DataType.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @Column({
    type: DataType.STRING(191),
    allowNull: false,
  })
  name!: string;

  // ✅ MUST EXIST (DB me already hai)
  @ForeignKey(() => Religion)
  @Column({
    type: DataType.BIGINT.UNSIGNED,
    allowNull: false,
  })
  religion_id!: number;

  @BelongsTo(() => Religion)
  religion!: Religion;

  @HasMany(() => Clan)
  clans!: Clan[];
}
