import { Inject, Injectable } from '@nestjs/common';
import { Mkc__factory } from './typechain';
import { Mkc } from './typechain/Mkc';

import {
  BigNumber,
  BigNumberish,
  ContractTransaction,
  providers,
  Wallet,
} from 'ethers';

import {
  BlockchainModuleOptions,
  BLOCKCHAIN_MODULE_OPTIONS,
} from './blockchain.common';

export type TokenTransferOptions = {
  receipt: string;
  amount: BigNumberish;
  signer?: string;
  fund?: boolean;
};

@Injectable()
export class BlockchainService {
  private provider: providers.JsonRpcProvider;
  private gameWallet: Wallet;
  public mkc: Mkc;

  constructor(
    @Inject(BLOCKCHAIN_MODULE_OPTIONS) private options: BlockchainModuleOptions,
  ) {
    this.provider = new providers.JsonRpcProvider(this.options.rpc);
    this.mkc = Mkc__factory.connect(this.options.mkc.address, this.provider);
    this.gameWallet = new Wallet(
      this.options.gameAccount.privateKey,
      this.provider,
    );
  }

  async getBlock(): Promise<number> {
    return this.provider.getBlockNumber();
  }

  async getTransactionReceipt(
    transactionHash: string,
  ): Promise<providers.TransactionReceipt> {
    return this.provider.getTransactionReceipt(transactionHash);
  }

  async getAvaxBalance(address: string): Promise<BigNumber> {
    return await this.provider.getBalance(address);
  }

  async getMkcBalance(address: string): Promise<BigNumber> {
    return await this.mkc.balanceOf(address);
  }

  async fundIfNeeded(receipt: string, gasRequired: BigNumber) {
    const gasPrice = await this.provider.getGasPrice();

    // Enough for 10 transfers
    const fundAmount = gasRequired.mul(gasPrice).mul(10);
    const minFundAmount = gasRequired.mul(gasPrice).mul(5);

    const receiptBalance = await this.getAvaxBalance(receipt);
    const gameWalletBalance = await this.getAvaxBalance(
      this.gameWallet.address,
    );

    if (gameWalletBalance.lte(fundAmount)) {
      throw new Error('Game wallet with insuficient funds');
    }

    // Fund if the avax balance is less than 5 transfers
    if (receiptBalance.lte(minFundAmount)) {
      const tx = await this.transferAvax(receipt, fundAmount);
      await tx.wait(1);
    }
  }

  async transferMkc(opts: TokenTransferOptions): Promise<ContractTransaction> {
    const sender = opts.signer
      ? new Wallet(opts.signer, this.provider)
      : this.gameWallet;

    if (opts.fund && opts.signer) {
      const gasRequired = await this.mkc
        .connect(sender)
        .estimateGas.transfer(opts.receipt, opts.amount);

      await this.fundIfNeeded(sender.address, gasRequired);
    }

    return await this.mkc.connect(sender).transfer(opts.receipt, opts.amount);
  }

  async transferAvax(
    receipt: string,
    amount: BigNumberish,
    signer?: string,
  ): Promise<providers.TransactionResponse> {
    const sender = signer ? new Wallet(signer, this.provider) : this.gameWallet;
    return await sender.sendTransaction({ to: receipt, value: amount });
  }
}
