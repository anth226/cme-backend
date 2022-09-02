import { Test } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';
import { RolesBuilder } from 'nest-access-control';
import { ExchangeMilitaryResourcesOwnVillagesDto } from './dto/exchange-resource-own.dto';
import { VillagesController } from './villages.controller';
import { VillagesService } from './villages.service';

describe('VillagesController test', () => {
  let villagesController: VillagesController;
  const mockVillagesService = {
    sendMilitaryResourcesFromVillage: jest.fn((dto) => {
      return dto;
    }),
  };
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [VillagesController],
      providers: [
        {
          provide: VillagesService,
          useValue: mock<VillagesService>(),
        },
        {
          provide: '__roles_builder__',
          useValue: mock<RolesBuilder>(),
        },
      ],
    })
      .overrideProvider(VillagesService)
      .useValue(mockVillagesService)
      .compile();

    villagesController = module.get<VillagesController>(VillagesController);
  });

  it('should be defined', () => {
    expect(villagesController).toBeDefined();
  });

  it('should send military resources to anohter village of same user', async () => {
    const exchangeMilitaryResourcesOwnVillagesDtoMock = new ExchangeMilitaryResourcesOwnVillagesDto();
    exchangeMilitaryResourcesOwnVillagesDtoMock.receiverVillageId = 2;
    exchangeMilitaryResourcesOwnVillagesDtoMock.resourcesSent = [
      {
        type: 'spearman',
        count: 100,
      },
      {
        type: 'pikeman',
        count: 100,
      },
    ];
    const result = villagesController.sendMilitaryResourcesFromVillage(
      { user: { id: 1 } },
      '1',
      exchangeMilitaryResourcesOwnVillagesDtoMock,
    );
  });
});
