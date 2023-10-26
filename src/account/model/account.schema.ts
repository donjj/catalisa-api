import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type AccountDocument = HydratedDocument<Account>

@Schema({ collection: 'accounts', timestamps: true })
export class Account {
  @Prop()
  fullName: string

  @Prop()
  accType: string

  @Prop()
  cpf: string

  @Prop()
  balance: number
}

export const AccountSchema = SchemaFactory.createForClass(Account)
