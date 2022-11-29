import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutomatedVillageHistory } from './automated-village-history.entity';
import { AutomatedVillageHistoryService } from './automated-village-history.service';

@Module({
  imports: [TypeOrmModule.forFeature([AutomatedVillageHistory])],
  providers: [AutomatedVillageHistoryService],
  exports: [AutomatedVillageHistoryService],
})
export class AutomatedVillageHistoryModule {}
