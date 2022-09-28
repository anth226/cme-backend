import {
  Injectable,
  Logger /*, HttpException, HttpStatus*/,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isEmpty } from 'lodash';
import { UserGlobalMKC } from 'apps/cme-backend/src/user-global-mkc/user-global-mkc.entity';
const HDWallet = require('ethereum-hdwallet');
const hdwallet = HDWallet.fromMnemonic(
  'tag volcano eight thank tide danger coast health above argue embrace heavy',
);
@Injectable()
export class BlockchainMsIngameMKCService {
  private logger: Logger = new Logger('BlockchainMsIngameMKCService');

  constructor(
    @InjectRepository(UserGlobalMKC)
    private userMKCBalanceRepository: Repository<UserGlobalMKC>,
  ) {}

  async getBalance(userId: number): Promise<any> {
    const balanceOrEmpty = await this.userMKCBalanceRepository.findOne({
      where: { user: { id: userId } },
    });

    if (isEmpty(balanceOrEmpty)) {
      this.userMKCBalanceRepository.save({
        balance: 0,
        user: {
          id: userId,
        },
      });
    }

    return {
      balance: balanceOrEmpty?.balance | 0,
    };
  }

  async getUserWallet(derive: number): Promise<any> {
    const mywallet = hdwallet.derive(`m/44'/60'/0'/0`);
    const walletAddress = `0x${mywallet
      .derive(derive)
      .getAddress()
      .toString('hex')}`;

    const privateKey = `${mywallet
      .derive(derive)
      .getPrivateKey()
      .toString('hex')}`;

    return {
      walletAddress,
      privateKey,
    };
  }
}
