import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ResourcesMsExchangesService } from './resources-ms-exchanges.service';
import { Village } from '../../../cme-backend/src/villages/village.entity';
import { VillageResourceType } from '../../../cme-backend/src/villages-resource-types/village-resource-type.entity';
import { ResourceType } from '../../../cme-backend/src/resource-types/resource-type.entity';

describe('ResourcesMsExchangesService', () => {
  let resourcesMsExchangesService: ResourcesMsExchangesService;
  const mockResourcesMsExchageRepository = {
    exchangeMilitaryResourcesBetweenSameUserVillages: jest.fn((dto) => {
      return dto;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResourcesMsExchangesService,
        {
          provide: getRepositoryToken(Village),
          useValue: mockResourcesMsExchageRepository,
        },
        {
          provide: getRepositoryToken(VillageResourceType),
          useValue: mockResourcesMsExchageRepository,
        },
        {
          provide: getRepositoryToken(ResourceType),
          useValue: mockResourcesMsExchageRepository,
        },
      ],
    })
      .overrideProvider(ResourcesMsExchangesService)
      .useValue(mockResourcesMsExchageRepository)
      .compile();

    resourcesMsExchangesService = module.get<ResourcesMsExchangesService>(
      ResourcesMsExchangesService,
    );
  });
  it('resources exchange', () => {
    expect(resourcesMsExchangesService).toBeDefined();
  });
  it('should leave guild', async () => {
    const res = await resourcesMsExchangesService.exchangeMilitaryResourcesBetweenSameUserVillages(
      1,
      2,
      [
        {
          type: 'spearman',
          count: 100,
        },
        {
          type: 'pikeman',
          count: 100,
        },
      ],
      1,
    );
  });
});
