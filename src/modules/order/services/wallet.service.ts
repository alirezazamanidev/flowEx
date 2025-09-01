import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import Big from 'big.js';
import Redis from 'ioredis';
import { REDIS_CLIENT } from 'src/configs/redis.config';
import { WalletEntity } from 'src/modules/wallet/entities/wallet.entity';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class WalletService {
  constructor(
    private dataSource: DataSource,
    @Inject(REDIS_CLIENT) private redisClient: Redis,
  ) {}

    async getOrCreateWallet(manager: EntityManager, userId: string, currency: string) {
    let wallet = await manager
      .createQueryBuilder(WalletEntity, 'w')
      .setLock('pessimistic_write')
      .where('w.userId = :userId AND w.currency = :currency', { userId, currency })
      .getOne();

    if (!wallet) {
      wallet = manager.create(WalletEntity, { userId, currency, balance: 0 });
      await manager.save(wallet);
    }

    return wallet;
  }

  async lockUsdForBuy(manager: EntityManager, userId: string, percent: number) {
    const usdWallet = await this.getOrCreateWallet(manager, userId, 'USD');
    const availableUSD = Big(usdWallet.balance).minus(usdWallet.lockedBalance);
    const amountToUse = availableUSD.times(percent).div(100);
    if (amountToUse.lte(0)) throw new BadRequestException('موجودی کافی نیست');
    usdWallet.lockedBalance = Big(usdWallet.lockedBalance).plus(amountToUse).toNumber();
    await manager.save(usdWallet);
    return amountToUse;
  }
  async lockCryptoForSell(manager: EntityManager, userId: string, currency: string, percent: number) {
    const cryptoWallet = await this.getOrCreateWallet(manager, userId, currency);
    const availableCrypto = Big(cryptoWallet.balance).minus(cryptoWallet.lockedBalance);
    const amountToUse = availableCrypto.times(percent).div(100);
    if (amountToUse.lte(0)) throw new BadRequestException('موجودی کافی نیست');
    cryptoWallet.lockedBalance = Big(cryptoWallet.lockedBalance).plus(amountToUse).toNumber();
    await manager.save(cryptoWallet);
    return amountToUse;
  }
}
