import { Module } from '@nestjs/common'
import { AccountService } from './account.service'
import { AccountController } from './account.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Account, AccountSchema } from './model/account.schema'
import { Transaction, TransactionSchema } from './model/transaction.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Account.name, schema: AccountSchema },
      { name: Transaction.name, schema: TransactionSchema }
    ])
  ],
  providers: [AccountService],
  controllers: [AccountController]
})
export class AccountModule {}
