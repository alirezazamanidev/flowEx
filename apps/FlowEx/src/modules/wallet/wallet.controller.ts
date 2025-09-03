import { Body, Controller, Post } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { ApiConsumes, ApiOperation } from '@nestjs/swagger';

import { DepositDto } from './dto/deposit.dto';
import { Auth } from 'apps/gateway/src/modules/auth/decorators/auth.decourator';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @ApiOperation({summary:'Deposit money into wallet'})
  @Auth()
  @ApiConsumes(ContentTypeEnu.Form,ContentTypeEnum.Json)
  @Post('deposit')
  deposit(@Body() depositDto: DepositDto) {
    return this.walletService.deposit(depositDto);
  }
}
