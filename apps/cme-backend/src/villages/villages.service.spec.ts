import { Repository } from 'typeorm';
import { mock } from 'jest-mock-extended';
import { VillagesService } from './villages.service';
import { Village } from './village.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../users/user.entity';
import { CreateVillageDto } from './dto/create-village.dto';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FacilityType } from '../facility-types/facility-type.entity';
import { VillageResourceType } from '../villages-resource-types/village-resource-type.entity';

describe('VillagesService', () => {
  let service: VillagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VillagesService,
        {
          provide: getRepositoryToken(Village),
          useValue: mock<Repository<Village>>(),
        },
        {
          provide: getRepositoryToken(User),
          useValue: mock<Repository<User>>(),
        },
        {
          provide: getRepositoryToken(FacilityType),
          useValue: mock<Repository<FacilityType>>(),
        },
        {
          provide: getRepositoryToken(VillageResourceType),
          useValue: mock<Repository<VillageResourceType>>(),
        },
      ],
    }).compile();

    service = module.get<VillagesService>(VillagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should reject long village names', async () => {
    const dto = {
      name: 'W'.repeat(16),
      x: 1,
      y: 1,
    };

    await expect(service.create(dto as CreateVillageDto, 1)).rejects.toThrow(
      "Name can't be longer",
    );
  });
});
