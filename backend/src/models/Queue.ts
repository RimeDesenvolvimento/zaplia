import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Unique,
  BelongsToMany,
  BelongsTo,
  ForeignKey,
  HasMany,
  DataType,
  Default,
  Index
} from "sequelize-typescript";
import User from "./User";
import UserQueue from "./UserQueue";
import Company from "./Company";

import Whatsapp from "./Whatsapp";
import WhatsappQueue from "./WhatsappQueue";
import QueueOption from "./QueueOption";
import Prompt from "./Prompt";
import QueueIntegrations from "./QueueIntegrations";

@Table
class Queue extends Model<Queue> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id!: number;

  @AllowNull(false)
  @Index({ name: "queue_name_company_unique", unique: true })
  @Column
  name!: string;

  @AllowNull(false)
  @Index({ name: "queue_color_company_unique", unique: true })
  @Column
  color!: string;

  @Default("")
  @Column
  greetingMessage!: string;

  @Default("")
  @Column
  outOfHoursMessage!: string;

  @Column({
    type: DataType.JSONB
  })
  schedules!: [];

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @ForeignKey(() => Company)
  @Index({ name: "queue_name_company_unique", unique: true })
  @Index({ name: "queue_color_company_unique", unique: true })
  @Column
  companyId!: number;

  @BelongsTo(() => Company)
  company!: Company;

  @BelongsToMany(() => Whatsapp, () => WhatsappQueue)
  whatsapps!: Array<Whatsapp & { WhatsappQueue: WhatsappQueue }>;

  @BelongsToMany(() => User, () => UserQueue)
  users!: Array<User & { UserQueue: UserQueue }>;

  @HasMany(() => QueueOption, {
    onDelete: "DELETE",
    onUpdate: "DELETE",
    hooks: true
  })
  options!: QueueOption[];

  @Column
  orderQueue!: number;

  @ForeignKey(() => QueueIntegrations)
  @Column
  integrationId!: number;

  @BelongsTo(() => QueueIntegrations)
  queueIntegrations!: QueueIntegrations;

  @ForeignKey(() => Prompt)
  @Column
  promptId!: number;

  @BelongsTo(() => Prompt)
  prompt!: Prompt;
}

export default Queue;
