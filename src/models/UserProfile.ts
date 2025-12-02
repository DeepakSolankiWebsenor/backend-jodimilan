import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { User } from './User';
import { Country } from './Country';
import { State } from './State';
import { City } from './City';
import { Caste } from './Caste';
import { Area } from './Area';

@Table({
  tableName: 'user_profiles',
  timestamps: true,
})
export class UserProfile extends Model {
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    unique: true,
  })
  user_id!: number;

  @Column({
    type: DataType.STRING(191),
    allowNull: true,
  })
  gothra?: string;

  @Column({
    type: DataType.STRING(191),
    allowNull: true,
  })
  moon_sign?: string;

  @Column({
    type: DataType.STRING(191),
    allowNull: true,
  })
  manglik?: string;

  @ForeignKey(() => Country)
  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  birth_country?: number;

  @ForeignKey(() => State)
  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  birth_state?: number;

  @ForeignKey(() => City)
  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  birth_city?: number;

  @Column({
    type: DataType.STRING(191),
    allowNull: true,
  })
  birth_time?: string;

  @Column({
    type: DataType.STRING(191),
    allowNull: true,
  })
  educations?: string;

  @Column({
    type: DataType.STRING(191),
    allowNull: true,
  })
  annual_income?: string;

  @Column({
    type: DataType.STRING(191),
    allowNull: true,
  })
  occupation?: string;

  @Column({
    type: DataType.STRING(191),
    allowNull: true,
  })
  employeed_in?: string;

  @Column({
    type: DataType.STRING(191),
    allowNull: true,
  })
  height?: string;

  @Column({
    type: DataType.STRING(191),
    allowNull: true,
  })
  diet?: string;

  @Column({
    type: DataType.STRING(191),
    allowNull: true,
  })
  drink?: string;

  @Column({
    type: DataType.STRING(191),
    allowNull: true,
  })
  smoke?: string;

  @Column({
    type: DataType.STRING(191),
    allowNull: true,
  })
  no_of_brothers?: string;

  @Column({
    type: DataType.STRING(191),
    allowNull: true,
  })
  no_of_sisters?: string;

  @Column({
    type: DataType.STRING(191),
    allowNull: true,
  })
  father_occupation?: string;

  @Column({
    type: DataType.STRING(191),
    allowNull: true,
  })
  father_contact_no?: string;

  @Column({
    type: DataType.STRING(191),
    allowNull: true,
  })
  mother_occupation?: string;

  @Column({
    type: DataType.STRING(191),
    allowNull: true,
  })
  mother_contact_no?: string;

  @ForeignKey(() => Caste)
  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  mother_caste?: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  about_yourself?: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  partner_prefernces?: string;

  @Column({
    type: DataType.STRING(191),
    allowNull: true,
  })
  photo_privacy?: string;

  @Column({
    type: DataType.STRING(191),
    allowNull: true,
  })
  contact_privacy?: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  profile_image?: string;

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  thikhana_id?: number;

  @ForeignKey(() => State)
  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  thikana_state?: number;

  @ForeignKey(() => City)
  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  thikana_city?: number;

  @ForeignKey(() => Area)
  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  thikana_area?: number;

  @ForeignKey(() => State)
  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  ed_state?: number;

  @ForeignKey(() => City)
  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  ed_city?: number;

  @ForeignKey(() => Country)
  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  ed_country?: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  education_details?: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  occupation_details?: string;

  // Relationships
  @BelongsTo(() => User)
  user!: User;

  @BelongsTo(() => Country, 'birth_country')
  birthCountry?: Country;

  @BelongsTo(() => State, 'birth_state')
  birthState?: State;

  @BelongsTo(() => City, 'birth_city')
  birthCity?: City;

  @BelongsTo(() => Caste, 'mother_caste')
  motherCaste?: Caste;

  @BelongsTo(() => State, 'thikana_state')
  thikanaState?: State;

  @BelongsTo(() => City, 'thikana_city')
  thikanaCity?: City;

  @BelongsTo(() => Area, 'thikana_area')
  thikanaArea?: Area;

  @BelongsTo(() => State, 'ed_state')
  edState?: State;

  @BelongsTo(() => City, 'ed_city')
  edCity?: City;

  @BelongsTo(() => Country, 'ed_country')
  edCountry?: Country;
}
