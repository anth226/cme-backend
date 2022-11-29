import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, QueryRunner, Repository } from 'typeorm';
import { UserGlobalMKC } from 'apps/cme-backend/src/user-global-mkc/user-global-mkc.entity';
import { utils } from 'ethers';

@Injectable()
export class BlockchainMsIngameMKCService {
  private logger: Logger = new Logger('BlockchainMsIngameMKCService');

  constructor(
    private connection: Connection,
    @InjectRepository(UserGlobalMKC)
    private userMKCBalanceRepository: Repository<UserGlobalMKC>,
  ) {}

  async getBalance(userId: number): Promise<UserGlobalMKC> {
    let balance = await this.userMKCBalanceRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!balance) {
      balance = await this.userMKCBalanceRepository.save({
        balance: '0',
        user: { id: userId },
      });
    }

    return balance;
  }

  async incrementBalance(
    userId: number,
    amount: string,
    queryRunner: QueryRunner,
  ) {
    // Lock mkc balance for update
    const [balance] = await queryRunner.query(`
          SELECT * FROM user_mkc_wallets
          WHERE user_id = ${userId}
          FOR UPDATE
          LIMIT 1
      `);

    if (!balance) {
      await queryRunner.query(`
            INSERT INTO user_mkc_wallets (user_id,balance)
            VALUES (${userId},${amount})
          `);
    } else {
      const newBalance = utils.formatEther(
        utils.parseEther(balance.balance).add(utils.parseEther(amount)),
      );

      await queryRunner.query(`
          UPDATE user_mkc_wallets
          SET balance = ${newBalance}
          WHERE user_id = ${userId} AND id = ${balance.id}
      `);
    }
  }

  async decreasePendingBalance(
    userId: number,
    amount: string,
    queryRunner: QueryRunner,
  ) {
    const lockedBalance = await this.lockBalanceForDecrease(
      userId,
      amount,
      queryRunner,
    );

    await queryRunner.query(`
          UPDATE user_mkc_wallets
          SET balance_pending_withdrawal = ${lockedBalance.newBalancePending}
          WHERE user_id = ${userId} AND id = ${lockedBalance.balanceId}
      `);
  }

  async decreaseBalance(
    userId: number,
    amount: string,
    queryRunner: QueryRunner,
  ) {
    const lockedBalance = await this.lockBalanceForDecrease(
      userId,
      amount,
      queryRunner,
    );

    await queryRunner.query(`
          UPDATE user_mkc_wallets
          SET balance = ${lockedBalance.newBalance}, balance_pending_withdrawal = ${lockedBalance.newBalancePending}
          WHERE user_id = ${userId} AND id = ${lockedBalance.balanceId}
      `);
  }

  private async lockBalanceForDecrease(
    userId: number,
    decreaseAmount: string,
    queryRunner: QueryRunner,
  ): Promise<lockedBalance> {
    const [balance] = await queryRunner.query(`
          SELECT * FROM user_mkc_wallets
          WHERE user_id = ${userId}
          FOR UPDATE
          LIMIT 1
      `);

    if (!balance) {
      throw new Error('Insufficient MKC balance');
    }

    const decreaseAmountInWei = utils.parseEther(decreaseAmount);
    const balanceInWei = utils.parseEther(balance.balance);
    const balancePendingInWei = utils.parseEther(
      balance.balance_pending_withdrawal,
    );

    if (
      balanceInWei.lt(decreaseAmountInWei) ||
      balancePendingInWei.lt(decreaseAmountInWei)
    ) {
      throw new Error('Insufficient MKC balance');
    }

    const newBalance = utils.formatEther(balanceInWei.sub(decreaseAmountInWei));
    const newBalancePending = utils.formatEther(
      balancePendingInWei.sub(decreaseAmountInWei),
    );

    return {
      balanceId: balance.id,
      newBalance,
      newBalancePending,
    };
  }
}

type lockedBalance = {
  balanceId: number;
  newBalance: string;
  newBalancePending: string;
};
