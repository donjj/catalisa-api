import { PartialType } from '@nestjs/swagger'
import { Account } from './account.schema'

export class AccountPayload extends PartialType(Account) {
  createdA?: string
  updateAt?: string
  transaction_id?: string
}
