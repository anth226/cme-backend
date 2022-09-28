import { Injectable } from '@nestjs/common';

@Injectable()
export class BlockchainService {
  public async getPublicKey(web3: any, private_key: string) {
    const publicKeyAccount = await web3.eth.accounts.privateKeyToAccount(
      private_key,
    );
    if (publicKeyAccount == null) throw 'invalid private key';
    const publicKey = publicKeyAccount.address;
    return publicKey;
  }
  public gasMultiplier(mode) {
    switch (mode) {
      case 'low':
        return 1;
      case 'medium':
        return 1.5;
      case 'fast':
        return 2;
      default:
        return null;
    }
  }

  public async sendSignedTransaction(
    web3: any,
    toAddress: string,
    private_key: string,
    gasFee: number,
    sendValue: string,
    gasLimit: number,
  ) {
    try {
      const publicKey = await this.getPublicKey(web3, private_key);

      const txCount = await web3.eth.getTransactionCount(publicKey);
      const txObject = {
        nonce: web3.utils.toHex(txCount),
        gasLimit: web3.utils.toHex(gasLimit - 100),
        gasPrice: gasFee,
        to: toAddress,
        value: sendValue,
      };

      const signTransaction = await web3.eth.accounts.signTransaction(
        txObject,
        private_key,
      );

      const tranasctionReceipt = await web3.eth.sendSignedTransaction(
        signTransaction.rawTransaction,
      );

      return tranasctionReceipt;
    } catch (error: any) {
      console.log(error);
      if (error.receipt !== undefined) return error.receipt;
      return error;
    }
  }
}
