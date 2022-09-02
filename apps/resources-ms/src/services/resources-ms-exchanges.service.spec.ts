import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ResourcesMsExchangesService } from './resources-ms-exchanges.service';
import { Village } from '../../../cme-backend/src/villages/village.entity';
import { VillageResourceType } from '../../../cme-backend/src/villages-resource-types/village-resource-type.entity';
import { ResourceType } from '../../../cme-backend/src/resource-types/resource-type.entity';

describe('ResourcesMsExchangesService', () => {
  let resourcesMsExchangesService: ResourcesMsExchangesService;
  const mockResourcesMsExchageRepository = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((guild) => Promise.resolve(guild)),
    delete: jest.fn(),
    remove: jest.fn(),
    findByIds: jest.fn(
      (ids: number[]) =>
        new Promise((resolve) => {
          resolve(ids);
        }),
    ),
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
    }).compile();

    resourcesMsExchangesService = module.get<ResourcesMsExchangesService>(
      ResourcesMsExchangesService,
    );
  });
  it('should be defined', () => {
    expect(resourcesMsExchangesService).toBeDefined();
  });
});
