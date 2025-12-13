import { Table, Column, Model, DataType } from "sequelize-typescript";

interface EnquiryAttributes {
  id?: number;
  name: string;
  contact_no: string;
  message: string;
}

@Table({ tableName: "enquiries", timestamps: true })
export class Enquiry extends Model<EnquiryAttributes> {

  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.STRING(10),
    allowNull: false,
  })
  contact_no!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  message!: string;
}
