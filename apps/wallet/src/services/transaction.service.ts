import { HttpService } from '@nestjs/axios';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { TransactionStatus } from '../common/enums/status.enum';
import { TransactionType } from '../common/enums/type.enum';
import { TransactionEntity } from '../entities/transaction.entity';
import { ZarinPalService } from './zarinpale.service';
import { WalletService } from './wallet.service';
import { verifyPaymentDto } from '@app/common';

@Injectable()
export class TransactionService {
  constructor(
    private readonly zarinpalService: ZarinPalService,
    private dataSource: DataSource,
    @Inject(forwardRef(() => WalletService))
    private walletService: WalletService,
  ) {}

  async create(manager: EntityManager, userId: string, amount: number) {
    const transaction = manager.create(TransactionEntity, {
      userId,
      amount,
      type: TransactionType.DEPOSIT,
      status: TransactionStatus.PENDING,
      currency: 'IRR',
    });
    await manager.save(transaction);
    return transaction;
  }
  async getGatewayUrl(
    manager: EntityManager,
    userId: string,
    email: string,
    amount: number,
  ) {
    // create transaction
    const transaction = await this.create(manager, userId, amount);
    // create gateway url
    const { authority } = await this.zarinpalService.sendRequest(amount, email);
    await manager.update(
      TransactionEntity,
      { id: transaction.id },
      { authority },
    );
    return `${process.env.ZARINPAL_START_PAY_URL}${authority}`;
  }

  async verifyPayment(dto: verifyPaymentDto): Promise<string> {
    const { authority, status } = dto;
    const transaction = await this.dataSource.manager.findOne(
      TransactionEntity,
      { where: { authority } },
    );
    if (!transaction) return `http://frontend.com/payments?status=failed`;
    if (transaction.status !== TransactionStatus.PENDING)
      return `http://frontend.com/payments?status=success`;
    if (status === 'NOK') {
      transaction.status = TransactionStatus.CANCELED;
      await this.dataSource.manager.save(transaction);
      return `http://frontend.com/payments?status=canceled`;
    }
    if (status === 'OK') {
      const { success } = await this.zarinpalService.verify(
        authority,
        transaction.amount,
      );
      if (success) {
        transaction.status = TransactionStatus.COMPLETED;
        await this.dataSource.manager.save(transaction);
        //  charge wallet
        await this.walletService.chargeWallet(
          transaction.amount,
          transaction.userId,
        );
        return `http://frontend.com/payments?status=completed`;
      }
    }
    return `http://frontend.com/payments?status=failed`;
  }
}
