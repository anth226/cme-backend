import { UserRepository } from './../../cme-backend/src/users/user.repository';
import { TransferCoinCronService } from './services/transfer.service';
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

@Module({
  imports: [
    ConfigurationModule.register({
      projectRoot: path.resolve(__dirname, '..'),
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
    BlockchainModule,
    TypeOrmModule.forFeature([UserGlobalMKC]),
    TypeOrmModule.forFeature([UserRepository]),
  ],
  controllers: [BlockchainMsController],
  providers: [
    BlockchainMsIngameMKCService,
    BlockchainMsMKCRelayService,
    TransferCoinCronService,
  ],
})
export class BlockchainMsModule {
  constructor(private _connection: Connection) {}
}
