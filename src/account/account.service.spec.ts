import { Test, TestingModule } from '@nestjs/testing'
import { getModelToken } from '@nestjs/mongoose'
import { AccountService } from './account.service'
import { Account } from './model/account.schema'
import {
  CreateAccountInput,
  TransferInput,
  ChangeAccountInput
} from './model/account.input'
import { NotFoundException, UnprocessableEntityException } from '@nestjs/common'
import { Transaction } from './model/transaction.schema'

describe('AccountService', () => {
  let accountService: AccountService
  const mockAccountModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    updateOne: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
    deleteOne: jest.fn()
  }

  const mockTransactionModel = {
    create: jest.fn(),
    findOne: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        {
          provide: getModelToken(Account.name),
          useValue: mockAccountModel
        },
        {
          provide: getModelToken(Transaction.name),
          useValue: mockTransactionModel
        }
      ]
    }).compile()

    accountService = module.get<AccountService>(AccountService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(accountService).toBeDefined()
  })

  describe('createAccount', () => {
    it('should create a new account', async () => {
      const input: CreateAccountInput = {
        fullName: 'Paulo',
        accType: 'corrente',
        cpf: '95759897080',
        balance: 5
      }

      mockAccountModel.findOne.mockResolvedValue(null)
      mockAccountModel.create.mockResolvedValue(input)

      const result = await accountService.createAccount(input)

      expect(mockAccountModel.findOne).toHaveBeenCalledWith({ cpf: input.cpf })
      expect(mockAccountModel.create).toHaveBeenCalledWith(input)
      expect(result).toEqual(input)
    })

    it('should throw UnprocessableEntityException if account with the same CPF exists', async () => {
      const input: CreateAccountInput = {
        fullName: 'Paulo',
        accType: 'corrente',
        cpf: '95759897080',
        balance: 5
      }

      mockAccountModel.findOne.mockResolvedValue({})

      try {
        await accountService.createAccount(input)
      } catch (error) {
        expect(error).toBeInstanceOf(UnprocessableEntityException)
        expect(error.message).toBe('Cpf already exists')
      }
    })
  })

  describe('transfer', () => {
    it('should transfer funds between accounts', async () => {
      const receiverAccount = {
        cpf: 'receiverCpf',
        id: 'receiverId',
        balance: 100
      }
      const depositerAccount = {
        cpf: 'depositerCpf',
        id: 'depositerId',
        balance: 200
      }

      const transferInput: TransferInput = {
        receiverCpf: 'receiverCpf',
        depositerCpf: 'depositerCpf',
        amount: 50
      }

      mockAccountModel.findOne
        .mockResolvedValueOnce(receiverAccount)
        .mockResolvedValueOnce(depositerAccount)
      const updatedReceiverAccount = { ...receiverAccount, balance: 150 }
      const updatedDepositerAccount = { ...depositerAccount, balance: 150 }

      mockAccountModel.updateOne.mockResolvedValueOnce(updatedReceiverAccount)
      mockAccountModel.updateOne.mockResolvedValueOnce(updatedDepositerAccount)
      mockAccountModel.findById.mockResolvedValue(updatedReceiverAccount)

      const result = await accountService.transfer(transferInput)

      expect(result).toHaveProperty('transaction_id')

      expect(mockAccountModel.updateOne).toHaveBeenCalledWith(
        { _id: receiverAccount.id },
        { balance: updatedReceiverAccount.balance }
      )
      expect(mockAccountModel.updateOne).toHaveBeenCalledWith(
        { _id: depositerAccount.id },
        { balance: updatedDepositerAccount.balance }
      )
    })

    it('should throw a NotFoundException for non-existing receiver account', async () => {
      mockAccountModel.findOne.mockResolvedValueOnce(null)

      const transferInput: TransferInput = {
        receiverCpf: 'receiverCpf',
        depositerCpf: 'depositerCpf',
        amount: 50
      }

      await expect(accountService.transfer(transferInput)).rejects.toThrow(
        NotFoundException
      )
      expect(mockAccountModel.updateOne).not.toHaveBeenCalled()
    })

    it('should throw a NotFoundException for non-existing depositer account', async () => {
      mockAccountModel.findOne.mockResolvedValueOnce({})
      mockAccountModel.findOne.mockResolvedValueOnce(null)

      const transferInput: TransferInput = {
        receiverCpf: 'receiverCpf',
        depositerCpf: 'depositerCpf',
        amount: 50
      }

      await expect(accountService.transfer(transferInput)).rejects.toThrow(
        NotFoundException
      )
      expect(mockAccountModel.updateOne).not.toHaveBeenCalled()
    })

    it('should throw an UnprocessableEntityException for insufficient funds', async () => {
      const receiverAccount = {
        cpf: 'receiverCpf',
        id: 'receiverId',
        balance: 100
      }
      const depositerAccount = {
        cpf: 'depositerCpf',
        id: 'depositerId',
        balance: 50
      }

      const transferInput: TransferInput = {
        receiverCpf: 'receiverCpf',
        depositerCpf: 'depositerCpf',
        amount: 60
      }

      mockAccountModel.findOne
        .mockResolvedValueOnce(receiverAccount)
        .mockResolvedValueOnce(depositerAccount)

      await expect(accountService.transfer(transferInput)).rejects.toThrow(
        UnprocessableEntityException
      )
      expect(mockAccountModel.updateOne).not.toHaveBeenCalled()
    })
  })

  describe('deposit', () => {
    it('should deposit funds into an existing account', async () => {
      const existingAccount = {
        cpf: 'accountCpf',
        id: 'accountId',
        balance: 100
      }

      const depositInput: ChangeAccountInput = {
        cpf: 'accountCpf',
        amount: 50
      }

      mockAccountModel.findOne.mockResolvedValue(existingAccount)

      const updatedAccount = { ...existingAccount, balance: 150 }

      mockAccountModel.updateOne.mockResolvedValue(updatedAccount)
      mockAccountModel.findById.mockResolvedValue(updatedAccount)

      const result = await accountService.deposit(depositInput)

      expect(result).toHaveProperty('transaction_id')

      expect(mockAccountModel.updateOne).toHaveBeenCalledWith(
        { _id: existingAccount.id },
        { balance: updatedAccount.balance }
      )
    })

    it('should throw a NotFoundException for a non-existing account', async () => {
      mockAccountModel.findOne.mockResolvedValue(null)

      const depositInput: ChangeAccountInput = {
        cpf: 'accountCpf',
        amount: 50
      }

      await expect(accountService.deposit(depositInput)).rejects.toThrow(
        NotFoundException
      )
      expect(mockAccountModel.updateOne).not.toHaveBeenCalled()
    })
  })

  describe('withdraw', () => {
    it('should withdraw funds from an existing account with sufficient balance', async () => {
      const existingAccount = {
        cpf: 'accountCpf',
        id: 'accountId',
        balance: 100
      }

      const withdrawInput: ChangeAccountInput = {
        cpf: 'accountCpf',
        amount: 50
      }

      mockAccountModel.findOne.mockResolvedValue(existingAccount)

      const updatedAccount = { ...existingAccount, balance: 50 }

      mockAccountModel.updateOne.mockResolvedValue(updatedAccount)
      mockAccountModel.findById.mockResolvedValue(updatedAccount)

      const result = await accountService.withdraw(withdrawInput)

      expect(result).toHaveProperty('transaction_id')

      expect(mockAccountModel.updateOne).toHaveBeenCalledWith(
        { _id: existingAccount.id },
        { balance: updatedAccount.balance }
      )
    })

    it('should throw a NotFoundException for a non-existing account', async () => {
      mockAccountModel.findOne.mockResolvedValue(null)

      const withdrawInput: ChangeAccountInput = {
        cpf: 'accountCpf',
        amount: 50
      }

      await expect(accountService.withdraw(withdrawInput)).rejects.toThrow(
        NotFoundException
      )
      expect(mockAccountModel.updateOne).not.toHaveBeenCalled()
    })

    it('should throw an UnprocessableEntityException for insufficient funds', async () => {
      const existingAccount = {
        cpf: 'accountCpf',
        id: 'accountId',
        balance: 40
      }

      const withdrawInput: ChangeAccountInput = {
        cpf: 'accountCpf',
        amount: 50
      }

      mockAccountModel.findOne.mockResolvedValue(existingAccount)

      await expect(accountService.withdraw(withdrawInput)).rejects.toThrow(
        UnprocessableEntityException
      )
      expect(mockAccountModel.updateOne).not.toHaveBeenCalled()
    })
  })
})
