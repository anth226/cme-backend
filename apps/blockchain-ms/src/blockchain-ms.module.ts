import { UserRepository } from './../../cme-backend/src/users/user.repository';
import * as path from 'path';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { RedisModule } from 'nestjs-redis';
import { ScheduleModule } from '@nestjs/schedule';

import { ConfigurationModule, ConfigurationService } from '@app/configuration';
import { RedlockModule } from '@app/redlock';
import { BlockchainMsController } from './blockchain-ms.controller';
import { BlockchainMsIngameMKCService } from './services/blockchain-ms-ingame-mkc.service';
import { BlockchainMsMKCRelayService } from './services/blockchain-ms-mkc-relay.service';
import { UserGlobalMKC } from 'apps/cme-backend/src/user-global-mkc/user-global-mkc.entity';
import { BlockchainModule } from '@app/blockchain';
import { UserWalletTranfer } from 'apps/cme-backend/src/user-wallet-transfers/user-wallet-transfers.entity';

@Module({
  imports: [
    ConfigurationModule.register({
      projectRoot: path.resolve(__dirname, '..'),
      configRoot: path.resolve(__dirname, '..', '..', '..', 'config'),
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigurationModule],
      useFactory: (configurationService: ConfigurationService) =>
        configurationService.get('typeorm'),
      inject: [ConfigurationService],
    }),
    RedisModule.forRootAsync({
      imports: [ConfigurationModule],
      useFactory: (configurationService: ConfigurationService) =>
        configurationService.get('db.redis'),
      inject: [ConfigurationService],
    }),
    RedlockModule,
    BlockchainModule.registerAsync({
      imports: [ConfigurationModule],
      useFactory: (configurationService: ConfigurationService) =>
        configurationService.get('crypto'),
      inject: [ConfigurationService],
    }),
    TypeOrmModule.forFeature([UserGlobalMKC]),
    TypeOrmModule.forFeature([UserWalletTranfer]),
    TypeOrmModule.forFeature([UserRepository]),
  ],
  controllers: [BlockchainMsController],
  providers: [BlockchainMsIngameMKCService, BlockchainMsMKCRelayService],
})
export class BlockchainMsModule {
  constructor(private _connection: Connection) {}
}
