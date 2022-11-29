import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { HDNode } from '@ethersproject/hdnode';
import { User } from 'apps/cme-backend/src/users/user.entity';
import { nanoid } from 'nanoid';
import { BigNumber, utils } from 'ethers';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from 'apps/cme-backend/src/users/user.repository';
import { CreateWalletMsResp, GetWalletMsResp } from '../service-messages';
import { BlockchainService } from '@app/blockchain/blockchain.service';
import { ConfigurationService } from '@app/configuration';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BlockchainMsIngameMKCService } from './blockchain-ms-ingame-mkc.service';
import { Connection, QueryRunner, Repository } from 'typeorm';
import { TransferEvent } from '@app/blockchain/typechain/Mkc';

import {
  TransferStatus,
  TransferType,
  UserWalletTranfer,
} from 'apps/cme-backend/src/user-wallet-transfers/user-wallet-transfers.entity';
import { isEmpty } from 'lodash';

/**
 * Wallet derivation depends on a unique derivation id, which should be of an adecuate bitsize,
 * and a custom derivation path:
 *
 *    m/purpose'/coin_type'/account0'/account1'/account2'/account3'/address_index
 *
 * Using this path we can have up to 124 bits ids.
 * A 15 byte id gives us a small enough collision probability (https://zelark.github.io/nano-id-cc/)
 */
const WALLET_DERIVATION_BASE_PATH = "m/44'/60'";
const DERIVATION_INDEX_SIZE = 15;
const REQUIRED_CONFIRMATIONS = 50;
const MAX_TRANSFER_RETRIES = 5;

//please enter new mnemonic and place it only on server (use dummy mnemonic for local development)
const hdwallet = HDNode.fromMnemonic(
  'tag volcano eight thank tide danger coast health above argue embrace heavy',
);

// Owned by the Crypto team.
// TODO:
// - functions (transferListener, createWallet, transferMKCToExternalWallet, feesComputing)
// - connectors (to subgraph api, blockchain etc...)
//
@Injectable()
export class BlockchainMsMKCRelayService {
  private gameAccount: string;
  private logger: Logger = new Logger('BlockchainMsMKCRelayService');

  constructor(
    @InjectRepository(User)
    private userRepository: UserRepository,
    @InjectRepository(UserWalletTranfer)
    private walletTransferRepository: Repository<UserWalletTranfer>,
    private blockchainService: BlockchainService,
    private ingameService: BlockchainMsIngameMKCService,
    private configurationService: ConfigurationService,
    private connection: Connection,
  ) {
    this.gameAccount = this.configurationService.get<string>(
      'crypto.gameAccount.address',
    );
    this.syncTransferListener();
  }

  // Gets the user wallet and generates a new derivationId if necesary
  async getWallet(userId: number): Promise<GetWalletMsResp> {
    const user = await this.userRepository.findOne(userId);

    if (!user.derivation_id) {
      user.derivation_id = nanoid(DERIVATION_INDEX_SIZE);
      await this.userRepository.save(user);
    }

    const wallet = await this.deriveWallet(user.derivation_id);

    return { derivationId: user.derivation_id, wallet };
  }

  // Creates a brand new user wallet
  async createWallet(userId: number) {
    const user = await this.userRepository.findOne(userId);
    if (isEmpty(user)) {
      return;
    }
    const derivationId = nanoid(DERIVATION_INDEX_SIZE);
    const wallet = await this.deriveWallet(derivationId);

    user.eth_wallet_addresses = wallet.address;
    user.eth_private_key = wallet.privateKey;
    user.derivation_id = derivationId;

    await this.userRepository.save(user);
    return;
  }

  // Derives a wallet
  async deriveWallet(derivationId: string): Promise<HDNode> {
    const accountIndex = Buffer.from(derivationId).toString('hex');
    const accountIndexBN = BigNumber.from('0x' + accountIndex);

    const account0 = accountIndexBN.mask(31).toString();
    const account1 = accountIndexBN.shr(31).mask(31).toString();
    const account2 = accountIndexBN.shr(62).mask(31).toString();
    const account3 = accountIndexBN.shr(93).mask(31).toString();

    const derivationPath = `${WALLET_DERIVATION_BASE_PATH}/${account0}'/${account1}'/${account2}'/${account3}'/0`;

    return hdwallet.derivePath(derivationPath);
  }

  async transferToExternalWallet(
    userId: number,
    address: string,
    amount: string,
  ) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get user balance and lock it to avoid double spending
      const [balance] = await queryRunner.query(
        `
            SELECT * FROM user_mkc_wallets
            WHERE user_id = $1
            FOR UPDATE
            LIMIT 1`,
        [userId],
      );

      if (!balance) {
        throw new Error('Insufficient MKC balance');
      }

      if (!utils.isAddress(address)) {
        throw new Error('External wallet address is not valid');
      }

      const userBalanceInWei = utils.parseEther(balance.balance);
      const amountToTransferInWei = utils.parseEther(amount);
      const userBalancePendingInWei = balance.balance_pending_withdrawal
        ? utils.parseEther(balance.balance_pending_withdrawal)
        : BigNumber.from(0);

      if (
        amountToTransferInWei.gt(userBalanceInWei.sub(userBalancePendingInWei))
      ) {
        throw new Error('Insufficient MKC balance');
      }

      // Register transfer
      await queryRunner.query(
        `
              INSERT INTO user_wallet_transfers (
                  type,status,mkc_amount,mkc_amount_without_fee,mkc_fee,
                  user_id,external_wallet_address
              )
              VALUES ($1,$2,$3,$4,$5,$6,$7)
              `,
        [
          TransferType.TO_EXTERNAL_WALLET,
          TransferStatus.PENDING,
          amount,
          amount,
          0,
          userId,
          address,
        ],
      );

      await queryRunner.query(
        `
          UPDATE user_mkc_wallets SET
            balance_pending_withdrawal = $1  
          WHERE id = $2
      `,
        [
          utils.formatEther(userBalancePendingInWei.add(amountToTransferInWei)),
          balance.id,
        ],
      );

      await queryRunner.commitTransaction();
    } catch (err) {
      this.logger.error(`transferToExternalWallet -- `, err);
      await queryRunner.rollbackTransaction();
      return new HttpException(err, HttpStatus.BAD_REQUEST);
    } finally {
      await queryRunner.release();
    }
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async syncTransferListener() {
    this.logger.log('TransferListener -- Syncing');
    const mkc = this.blockchainService.mkc;

    const users = await this.userRepository.find({
      select: ['eth_wallet_addresses'],
    });

    // Temporary 'any' because TypeChain is generating bad typings for EventFilters
    const userAddresses = users.map((u) => u.eth_wallet_addresses) as any;
    const transferFilter = mkc.filters.Transfer(null, userAddresses);

    // Register new listener right after removing the old one
    mkc.removeAllListeners();
    mkc.on(transferFilter, this.transferListener.bind(this));
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async processTransfers() {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const transfersToProcess = await queryRunner.query(`
          SELECT
            tr.id, tr.source_transaction_hash, tr.retries, tr.transaction_hash,
            tr.type, tr.status, tr.user_id, tr.mkc_amount, tr.external_wallet_address,
            u.eth_private_key, u.eth_wallet_addresses
          FROM user_wallet_transfers tr
          JOIN users u
            ON u.id = tr.user_id
          WHERE (status = 'PENDING' OR status = 'IN_PROGRESS')
            AND (type = 'TO_GAME_WALLET' OR type = 'TO_EXTERNAL_WALLET')
          FOR UPDATE OF tr SKIP LOCKED
      `);

      for (const transfer of transfersToProcess) {
        if (
          transfer.type == TransferType.TO_GAME_WALLET &&
          transfer.status == TransferStatus.PENDING
        ) {
          await this.processGamePendingTransfer(transfer, queryRunner);
        } else if (
          transfer.type == TransferType.TO_GAME_WALLET &&
          transfer.status == TransferStatus.IN_PROGRESS
        ) {
          await this.processGameInProgressTransfer(transfer, queryRunner);
        } else if (
          transfer.type == TransferType.TO_EXTERNAL_WALLET &&
          transfer.status == TransferStatus.PENDING
        ) {
          await this.processExternalPendingTransfer(transfer, queryRunner);
        } else if (
          transfer.type == TransferType.TO_EXTERNAL_WALLET &&
          transfer.status == TransferStatus.IN_PROGRESS
        ) {
          await this.processExternalInProgressTransfer(transfer, queryRunner);
        }
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      this.logger.error(`ProcessTransfers -- `, err);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  private async processGamePendingTransfer(
    transfer: Record<string, any>,
    queryRunner: QueryRunner,
  ) {
    try {
      const tx = await this.blockchainService.getTransactionReceipt(
        transfer.source_transaction_hash,
      );

      if (!tx || tx.confirmations < REQUIRED_CONFIRMATIONS) return;

      this.logger.log(
        `ProcessTransfers -- Processing PENDING transfer ${transfer.id}`,
      );

      const transferTx = await this.blockchainService.transferMkc({
        receipt: this.gameAccount,
        amount: utils.parseEther(transfer.mkc_amount),
        signer: transfer.eth_private_key,
        fund: true,
      });

      await transferTx.wait(1);

      await queryRunner.manager
        .getRepository(UserWalletTranfer)
        .update(transfer.id, {
          retries: 0,
          transactionHash: transferTx.hash,
          status: TransferStatus.IN_PROGRESS,
        });
    } catch (err) {
      this.logger.error(`ProcessTransfers -- `, err);
      await this.incrementTransferRetriesOrRevert(transfer, queryRunner);
    }
  }

  private async processGameInProgressTransfer(
    transfer: Record<string, any>,
    queryRunner: QueryRunner,
  ) {
    try {
      const tx = await this.blockchainService.getTransactionReceipt(
        transfer.transaction_hash,
      );

      if (!tx || tx.confirmations < REQUIRED_CONFIRMATIONS) return;

      this.logger.log(
        `ProcessTransfers -- Processing IN_PROCESS transfer ${transfer.id}`,
      );

      await this.ingameService.incrementBalance(
        transfer.user_id,
        transfer.mkc_amount,
        queryRunner,
      );

      await queryRunner.manager
        .getRepository(UserWalletTranfer)
        .update(transfer.id, {
          status: TransferStatus.DONE,
        });
    } catch (err) {
      this.logger.error(`ProcessTransfers -- `, err);
      await this.incrementTransferRetriesOrRevert(transfer, queryRunner);
    }
  }

  async processExternalPendingTransfer(
    transfer: Record<string, any>,
    queryRunner: QueryRunner,
  ) {
    try {
      this.logger.log(
        `ProcessTransfers -- Processing PENDING transfer ${transfer.id}`,
      );

      const transferTx = await this.blockchainService.transferMkc({
        receipt: transfer.external_wallet_address,
        amount: utils.parseEther(transfer.mkc_amount),
      });

      await transferTx.wait(1);

      await queryRunner.manager
        .getRepository(UserWalletTranfer)
        .update(transfer.id, {
          retries: 0,
          transactionHash: transferTx.hash,
          status: TransferStatus.IN_PROGRESS,
        });
    } catch (err) {
      this.logger.error(`ProcessTransfers -- `, err);
      await this.incrementTransferRetriesOrRevert(transfer, queryRunner);
    }
  }

  async processExternalInProgressTransfer(
    transfer: Record<string, any>,
    queryRunner: QueryRunner,
  ) {
    try {
      const tx = await this.blockchainService.getTransactionReceipt(
        transfer.transaction_hash,
      );

      if (!tx || tx.confirmations < REQUIRED_CONFIRMATIONS) return;

      this.logger.log(
        `ProcessTransfers -- Processing IN_PROCESS transfer ${transfer.id}`,
      );

      await this.ingameService.decreaseBalance(
        transfer.user_id,
        transfer.mkc_amount,
        queryRunner,
      );

      await queryRunner.manager
        .getRepository(UserWalletTranfer)
        .update(transfer.id, {
          status: TransferStatus.DONE,
        });
    } catch (err) {
      this.logger.error(`ProcessTransfers -- `, err);
      await this.incrementTransferRetriesOrRevert(transfer, queryRunner);
    }
  }

  private async incrementTransferRetriesOrRevert(
    transfer: Record<string, any>,
    queryRunner: QueryRunner,
  ) {
    if (transfer.retries == MAX_TRANSFER_RETRIES) {
      if (
        transfer.type == TransferType.TO_EXTERNAL_WALLET &&
        transfer.status == TransferStatus.PENDING
      ) {
        await this.ingameService.decreasePendingBalance(
          transfer.user_id,
          transfer.mkc_amount,
          queryRunner,
        );
      }
      await queryRunner.manager
        .getRepository(UserWalletTranfer)
        .update(transfer.id, {
          status: TransferStatus.FAILED,
        });
    } else {
      await queryRunner.manager
        .getRepository(UserWalletTranfer)
        .update(transfer.id, { retries: transfer.retries + 1 });
    }
  }

  async transferListener(
    from: string,
    to: string,
    amount: BigNumber,
    event: TransferEvent,
  ) {
    const user = await this.userRepository.findOne({
      where: { eth_wallet_addresses: to },
    });

    if (!user || amount.eq(0)) return;

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const amountToTransferInMKC = utils.formatEther(amount);

      this.logger.log(
        `TransferListener -- Creating transfer of ${amountToTransferInMKC} MKC from ${user.username} to Game Wallet`,
      );

      await queryRunner.query(
        `
              INSERT INTO user_wallet_transfers (
                  type,status,mkc_amount,mkc_amount_without_fee, 
                  mkc_fee,user_id,source_transaction_hash
              )
              VALUES ($1,$2,$3,$4,$5,$6,$7)
              ON CONFLICT (source_transaction_hash) DO NOTHING`,
        [
          TransferType.TO_GAME_WALLET,
          TransferStatus.PENDING,
          amountToTransferInMKC,
          amountToTransferInMKC,
          0,
          user.id,
          event.transactionHash,
        ],
      );

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error('TransferListener -- ', err);
    } finally {
      await queryRunner.release();
    }
  }
}
