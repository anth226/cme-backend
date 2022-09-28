import { Module } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { RPCService } from './rpc.service';

@Module({
  providers: [BlockchainService, RPCService],
  exports: [BlockchainService, RPCService],
})
export class BlockchainModule {}
