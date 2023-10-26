import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import {
  CreateAccountInput,
  TransferInput,
  ChangeAccountInput
} from './model/account.input'
import { AccountService } from './account.service'

@Controller({
  path: 'accounts',
  version: '1'
})
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  createAccount(@Body() body: CreateAccountInput) {
    return this.accountService.createAccount(body)
  }

  @Post('/transfer')
  transfer(@Body() body: TransferInput) {
    return this.accountService.transfer(body)
  }

  @Post('/deposit')
  deposit(@Body() body: ChangeAccountInput) {
    return this.accountService.deposit(body)
  }

  @Post('/withdraw')
  withdraw(@Body() body: ChangeAccountInput) {
    return this.accountService.withdraw(body)
  }

  @Get('/list')
  listAccount() {
    return this.accountService.listAccount()
  }

  @Get('/transactions')
  listTransactions() {
    return this.accountService.listTransactions()
  }

  @Get('/:id')
  findAccount(@Param('id') id: string) {
    return this.accountService.findAccount(id)
  }

  @Put('/:id')
  updateAccount(@Param('id') id: string, @Body() body: CreateAccountInput) {
    return this.accountService.updateAccount(id, body)
  }

  @Delete('/:id')
  deleteAccount(@Param('id') id: string) {
    return this.accountService.deleteAccount(id)
  }
}
