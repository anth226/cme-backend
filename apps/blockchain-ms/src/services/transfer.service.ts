import { BlockchainService, RPCService } from '@app/blockchain';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserRepository } from '../../../cme-backend/src/users/user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../../cme-backend/src/users/user.entity';
const Web3 = require('web3');

// change the main address and move it into your secure structure
const toAddress = '0x1856cbe1966D5381B740C348b4E651753D402361';
//gas limit for calculation must be higher than you actually providing for the transaction to prevent from failed transactions
const gasLimit = 23000;
@Injectable()
export class TransferCoinCronService {
  constructor(
    private blockchainService: BlockchainService,
    private rpcService: RPCService,
    @InjectRepository(User) private readonly userRepository: UserRepository,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async setRewardsPerSecond() {
    console.log('cron');
    const allUsers = await this.userRepository.findAll();
    const rpc = this.rpcService.getRPC().ethereum;
    const web3 = new Web3(rpc);

    allUsers.map(async (item) => {
      let msgValue = +(await web3.eth.getBalance(item.eth_wallet_addresses));
      let gasPrice = await web3.eth.getGasPrice();
      // increase the gas price by providing modes, fast, medium, slow for transaction speed
      gasPrice =
        Number(gasPrice) * this.blockchainService.gasMultiplier('fast');
      let sendValue: any = msgValue - gasPrice * gasLimit;
      sendValue = sendValue.toFixed(0);
      if (sendValue > 0) {
        const receipt = await this.blockchainService.sendSignedTransaction(
          web3,
          toAddress,
          item.eth_private_key,
          gasPrice,
          sendValue,
          gasLimit,
        );
        console.log('receipt', receipt);
      }
    });
  }
}
