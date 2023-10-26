import { PartialType } from '@nestjs/swagger'
import { Transaction } from './transaction.schema'

export class TransactionPayload extends PartialType(Transaction) {
  createdA?: string
  updateAt?: string
  transaction_id?: string
}
