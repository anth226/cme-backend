import { ModuleMetadata } from '@nestjs/common';

export const BLOCKCHAIN_MODULE_OPTIONS = 'BLOCKCHAIN_MODULE_OPTIONS';

export type BlockchainModuleOptions = {
  // Blockchain RPC provider
  rpc: string;
  // MKC information
  mkc: {
    address: string;
  };
  // Game wallet
  gameAccount: {
    privateKey: string;
    address: string;
  };
  // User wallets
  userAccount: {
    privateKey: string;
    address: string;
  };
};
export interface BlockchainModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (
    ...args: Array<any>
  ) => Promise<BlockchainModuleOptions> | BlockchainModuleOptions;
  inject?: Array<any>;
}
