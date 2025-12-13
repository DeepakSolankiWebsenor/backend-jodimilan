import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { User } from './User';

@Table({
  tableName: 'carts',
  timestamps: true,
})
export class Cart extends Model {
  @Column({
    type: DataType.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING(191),
    allowNull: false,
  })
  user_id!: string;

  @Column({
    type: DataType.STRING(191),
    allowNull: false,
  })
  subject_id!: string;

  @Column({
    type: DataType.STRING(191),
    allowNull: false,
  })
  number_of_days!: string;

  @Column({
    type: DataType.STRING(191),
    allowNull: false,
  })
  number_of_pages!: string;

  @Column({
    type: DataType.STRING(191),
    allowNull: false,
  })
  deadline!: string;

  @Column({
    type: DataType.STRING(191),
    allowNull: false,
  })
  total!: string;

  // Relationships
  @BelongsTo(() => User)
  user?: User;
}
