import { DynamicModule, Module, Provider } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';

import {
  BlockchainModuleAsyncOptions,
  BlockchainModuleOptions,
  BLOCKCHAIN_MODULE_OPTIONS,
} from './blockchain.common';

@Module({
  providers: [BlockchainService],
  exports: [BlockchainService],
})
export class BlockchainModule {
  static register(options: BlockchainModuleOptions): DynamicModule {
    return {
      module: BlockchainModule,
      providers: [
        {
          provide: BLOCKCHAIN_MODULE_OPTIONS,
          useValue: options,
        },
        BlockchainService,
      ],
      exports: [BlockchainService],
    };
  }

  static registerAsync(options: BlockchainModuleAsyncOptions): DynamicModule {
    return {
      module: BlockchainModule,
      imports: options.imports || [],
      providers: this.createAsyncProviders(options),
    };
  }

  private static createAsyncProviders(
    options: BlockchainModuleAsyncOptions,
  ): Array<Provider> {
    return [
      {
        provide: BLOCKCHAIN_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      },
    ];
  }
}
