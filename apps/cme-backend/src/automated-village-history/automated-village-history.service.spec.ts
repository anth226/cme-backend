import { Test, TestingModule } from '@nestjs/testing';
import { AutomatedVillageHistoryService } from './automated-village-history.service';

describe('AutomatedVillageHistoryService', () => {
  let service: AutomatedVillageHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AutomatedVillageHistoryService],
    }).compile();

    service = module.get<AutomatedVillageHistoryService>(
      AutomatedVillageHistoryService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
