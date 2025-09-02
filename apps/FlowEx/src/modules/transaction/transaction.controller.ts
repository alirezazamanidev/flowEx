import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import type { Request, Response } from 'express';
import { Auth } from '../auth/decorators/auth.decourator';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}
  
  @Get('callback')
  async paymentCallback(
    @Query('Status') status: string,
    @Query('Authority') authority: string,
    @Res() res: Response,
  ) {
 
    const result = await this.transactionService.verifyPayment(status, authority);
    return res.redirect(result);
  }
}
