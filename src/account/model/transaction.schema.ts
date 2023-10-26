import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type TransactionDocument = HydratedDocument<Transaction>

@Schema({ collection: 'transactions', timestamps: true })
export class Transaction {
  @Prop()
  transaction_id: string

  @Prop()
  details: string
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction)
