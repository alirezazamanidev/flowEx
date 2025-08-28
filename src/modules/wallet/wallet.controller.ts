import { Body, Controller, Post } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { ApiOperation } from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decourator';
import { DepositDto } from './dto/deposit.dto';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @ApiOperation({summary:'Deposit money into wallet'})
  @Auth()
  @Post('deposit')
  deposit(@Body() depositDto: DepositDto) {
    return this.walletService.deposit(depositDto);
  }
}
