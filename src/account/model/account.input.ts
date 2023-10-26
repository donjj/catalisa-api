import { IsNumber, IsString, Matches } from 'class-validator'
import { IsCPF } from 'class-validator-cpf'
import { ApiProperty } from '@nestjs/swagger'

export class CreateAccountInput {
  @ApiProperty({ example: 'Paulo' })
  @IsString()
  fullName: string

  @ApiProperty({ example: 'corrente' })
  @Matches(/^(corrente|poupança)$/, {
    message: 'account type must be corrente ou poupança'
  })
  accType: string

  @ApiProperty({ example: '95759897080' })
  @IsCPF()
  cpf: string

  @ApiProperty({ example: 5 })
  @IsNumber()
  balance: number
}

export class ChangeAccountInput {
  @ApiProperty({ example: '95759897080' })
  @IsCPF()
  cpf: string

  @ApiProperty({ example: 5 })
  @IsNumber()
  amount: number
}

export class TransferInput {
  @ApiProperty({ example: '27195610020' })
  @IsCPF()
  receiverCpf: string

  @ApiProperty({ example: '95759897080' })
  @IsCPF()
  depositerCpf: string

  @ApiProperty({ example: 5 })
  @IsNumber()
  amount: number
}
