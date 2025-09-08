import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  HasMany
} from "sequelize-typescript";
import Company from "./Company";

@Table
class Partner extends Model<Partner> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column(DataType.STRING)
  nome: string;

  @Column(DataType.STRING)
  email: string;

  @Column(DataType.STRING)
  cpfCpnj: string;

  @Column(DataType.STRING)
  urlParceiro: string;

  @Column(DataType.STRING)
  walletId: string;

  @Column(DataType.NUMBER)
  porcentagemComissao: number;

  @Column(DataType.STRING)
  telefone: string;

  @Column(DataType.STRING)
  status: string;

  @Column(DataType.STRING)
  password: string;

  @Column(DataType.DATE)
  criadoEm: Date;

  @Column(DataType.DATE)
  vencimento: Date;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @HasMany(() => Company, {
    onUpdate: "CASCADE",
    onDelete: "SET NULL"
  })
  companies: Company[];
}

export default Partner;
