import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Account } from './model/account.schema'
import { Transaction } from './model/transaction.schema'
import { Model } from 'mongoose'
import {
  CreateAccountInput,
  TransferInput,
  ChangeAccountInput
} from './model/account.input'
import { AccountPayload } from './model/account.payload'
import { TransactionPayload } from './model/transaction.payload'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class AccountService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<Account>,
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>
  ) {}

  async createAccount(body: CreateAccountInput): Promise<AccountPayload> {
    const foundAccount = await this.accountModel.findOne({ cpf: body.cpf })

    if (foundAccount) {
      throw new UnprocessableEntityException(`Cpf already exists`)
    }
    const createdAccount = await this.accountModel.create(body)
    return createdAccount
  }

  async transfer(body: TransferInput): Promise<AccountPayload> {
    const { receiverCpf, depositerCpf, amount } = body
    const receiverAccount = await this.accountModel.findOne({
      cpf: receiverCpf
    })

    const depositerAccount = await this.accountModel.findOne({
      cpf: depositerCpf
    })

    if (!receiverAccount) {
      throw new NotFoundException(
        `Receiver Account with cpf: ${receiverCpf} not found `
      )
    } else if (!depositerAccount) {
      throw new NotFoundException(
        `Depositer account with cpf: ${depositerCpf} not found `
      )
    } else if (depositerAccount.balance < amount) {
      throw new UnprocessableEntityException(
        `Depositer account with insufficient funds`
      )
    }
    await this.accountModel.updateOne(
      { _id: receiverAccount.id },
      { balance: receiverAccount.balance + amount }
    )
    await this.accountModel.updateOne(
      { _id: depositerAccount.id },
      { balance: depositerAccount.balance - amount }
    )
    await this.accountModel.findById(receiverAccount.id)

    const new_transaction_id = uuidv4()
    await this.transactionModel.create({
      transaction_id: new_transaction_id,
      details: JSON.stringify({ ...body })
    })
    return { transaction_id: new_transaction_id }
  }

  async deposit(body: ChangeAccountInput): Promise<AccountPayload> {
    const { cpf, amount } = body
    const account = await this.accountModel.findOne({ cpf: cpf })

    if (!account) {
      throw new NotFoundException(`Account with cpf: ${cpf} not found `)
    }
    await this.accountModel.updateOne(
      { _id: account.id },
      { balance: account.balance + amount }
    )

    await this.accountModel.findById(account.id)
    const new_transaction_id = uuidv4()

    await this.transactionModel.create({
      transaction_id: new_transaction_id,
      details: JSON.stringify({
        transaction_type: 'deposit',
        amount: amount,
        cpf: cpf
      })
    })
    return { transaction_id: new_transaction_id }
  }

  async withdraw(body: ChangeAccountInput): Promise<AccountPayload> {
    const { cpf, amount } = body
    const account = await this.accountModel.findOne({ cpf: cpf })

    if (!account) {
      throw new NotFoundException(`Account with cpf: ${cpf} not found `)
    } else if (account.balance < amount) {
      throw new UnprocessableEntityException(
        `Depositer account with insufficient funds`
      )
    }
    await this.accountModel.updateOne(
      { _id: account.id },
      { balance: account.balance - amount }
    )

    await this.accountModel.findById(account.id)
    const new_transaction_id = uuidv4()
    await this.transactionModel.create({
      transaction_id: new_transaction_id,
      details: JSON.stringify({
        transaction_type: 'withdraw',
        amount: amount,
        cpf: cpf
      })
    })
    return { transaction_id: new_transaction_id }
  }

  async findAccount(id: string): Promise<AccountPayload> {
    const account = await this.accountModel.findOne({ _id: id })

    if (!account) {
      throw new NotFoundException(`Account with id: ${id} not found `)
    }
    return account
  }

  async findTransaction(id: string): Promise<TransactionPayload> {
    const transaction = await this.transactionModel.findOne({
      transaction_id: id
    })

    if (!transaction) {
      throw new NotFoundException(
        `Account with transaction_id: ${id} not found `
      )
    }
    return transaction
  }

  async listAccount(): Promise<AccountPayload[]> {
    const accounts = await this.accountModel.find()
    return accounts
  }

  async listTransactions(): Promise<TransactionPayload[]> {
    const transactions = await this.transactionModel.find()
    return transactions
  }

  async updateAccount(
    id: string,
    body: CreateAccountInput
  ): Promise<AccountPayload> {
    await this.accountModel.updateOne({ _id: id }, body)
    const updatedAccount = this.accountModel.findById(id)
    return updatedAccount
  }

  async deleteAccount(id: string): Promise<void> {
    await this.accountModel.deleteOne({ _id: id })
  }
}
