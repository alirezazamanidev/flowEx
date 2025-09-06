import {
  Body,
  Controller,
  Get,
  Inject,
  OnModuleInit,
  Post,
  Query,
  Req,
} from '@nestjs/common';

import type { ClientGrpc } from '@nestjs/microservices';
import { GrpcPackageNames, WALLET_SERVICE_NAME, WalletServiceClient } from '@app/common';
import { ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decourator';
import { ContentTypeEnum } from '../../common/enums/form.enum';
import { DepositDto } from './dto/deposit.dto';
import type { Request } from 'express';

@Controller('wallet')
export class WalletController implements OnModuleInit {
  private walletServiceClient: WalletServiceClient;
  constructor(@Inject(GrpcPackageNames.WALLET) private client: ClientGrpc) {}

  onModuleInit() {
    this.walletServiceClient =
      this.client.getService<WalletServiceClient>(WALLET_SERVICE_NAME);
  }
  @ApiOperation({ summary: 'Deposit money into wallet' })
  @Auth()
  @ApiConsumes(ContentTypeEnum.Form, ContentTypeEnum.Json)
  @Post('deposit')
  deposit(@Body() depositDto: DepositDto, @Req() req: Request) {
    return this.walletServiceClient.Deposit({
      user: req.user,
      amount: depositDto.amount.toString(),
    });
  }

  @Get('callback')
  callback(
    @Query('Authority') authority: string,
    @Query('Status') status: string,
  ) {
    return this.walletServiceClient.verifyPayment({ authority, status });
  }
}
