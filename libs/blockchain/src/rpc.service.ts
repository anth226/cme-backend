import { Injectable } from '@nestjs/common';

@Injectable()
export class RPCService {
  constructor() {}

  private getMainnetRPC() {
    //please change the key and add it in env according to your security structure
    const keys = '3997ee3f35144eea83b33d9f693b9770';
    return {
      ethereum: `https://mainnet.infura.io/v3/${keys}`,
      polygon: `https://rpc-mainnet.maticvigil.com`,
      bsc: 'https://bsc-dataseed1.binance.org:443',
      avax: `https://api.avax.network/ext/bc/C/rpc`,
    };
  }

  private getTestnetRPC() {
    //please change the key and add it in env according to your security structure
    const keys = '3997ee3f35144eea83b33d9f693b9770';
    return {
      polygon: 'https://rpc-mumbai.maticvigil.com',
      ethereum: `https://rinkeby.infura.io/v3/${keys}`,
      bsc: 'https://data-seed-prebsc-1-s1.binance.org:8545',
      avax: `https://api.avax.network/ext/bc/C/rpc`,
    };
  }

  public getRPC() {
    //provide env through your existing structure
    const env = 'TESTNET';
    if (['TESTNET', 'DEVELOPMENT'].includes(env)) {
      return this.getTestnetRPC();
    }
    return this.getMainnetRPC();
  }
}
