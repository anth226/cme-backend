import { Repository } from 'typeorm';
import { mock } from 'jest-mock-extended';
import { Test, TestingModule } from '@nestjs/testing';
import { VillagesResourceTypesService } from './villages-resource-types.service';
import { VillageResourceType } from './village-resource-type.entity';

describe('VillagesResourceTypesService', () => {
  let service: VillagesResourceTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VillagesResourceTypesService,
        {
          provide: 'VillageResourceTypeRepository',
          useValue: mock<Repository<VillageResourceType>>(),
        },
      ],
    }).compile();

    service = module.get<VillagesResourceTypesService>(
      VillagesResourceTypesService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
