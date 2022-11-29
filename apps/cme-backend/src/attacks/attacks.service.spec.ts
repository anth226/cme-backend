import { Test, TestingModule } from '@nestjs/testing';
import { AttacksService } from './attacks.service';
import { User } from '../users/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Attack } from './attack.entity';
import { Repository } from 'typeorm';
import { mock, MockProxy } from 'jest-mock-extended';
import { Village } from '../villages/village.entity';
import { VillageResourceType } from '../villages-resource-types/village-resource-type.entity';
import { RedisService } from 'nestjs-redis';

describe('AttacksService', () => {
  const mockUser: User = new User();
  mockUser.id = 1;

  const mockUser2: User = new User();
  mockUser.id = 2;

  function attackFactory(
    attackingVillage: Village,
    defendingVillage: Village,
  ): (data: Partial<Attack>) => Attack {
    return (data: Partial<Attack>) => {
      return {
        id: 1,
        attackerVillage: attackingVillage,
        defenderVillage: defendingVillage,
        attacker: mockUser,
        defender: mockUser2,
        attackerWon: true,
        isUnderAttack: false,
        attackTime: new Date(),
        createdAt: new Date(),
        isTroopHome: true,
        report: {},
        stolenResources: {},
        unitSent: {},
        ...data,
      };
    };
  }

  let service: AttacksService;
  let attacksRepo: MockProxy<Repository<Attack>>;

  beforeEach(async () => {
    attacksRepo = mock<Repository<Attack>>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttacksService,
        { provide: getRepositoryToken(Attack), useValue: attacksRepo },
        {
          provide: getRepositoryToken(User),
          useValue: mock<Repository<User>>(),
        },
        {
          provide: getRepositoryToken(Village),
          useValue: mock<Repository<Village>>(),
        },
        {
          provide: getRepositoryToken(VillageResourceType),
          useValue: mock<Repository<VillageResourceType>>(),
        },
        { provide: RedisService, useValue: mock<RedisService>() },
      ],
    }).compile();

    service = module.get<AttacksService>(AttacksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return village coordinates', async () => {
    const attackingVillage = new Village();
    attackingVillage.x = 10;
    attackingVillage.y = 10;
    attackingVillage.id = 1;
    const atkPos = { x: attackingVillage.x, y: attackingVillage.y };

    const defendingVillage = new Village();
    defendingVillage.x = 5;
    defendingVillage.y = 5;
    defendingVillage.id = 2;
    const defPos = { x: defendingVillage.x, y: defendingVillage.y };

    const attack = attackFactory(attackingVillage, defendingVillage);
    const defence = attackFactory(defendingVillage, attackingVillage);
    attacksRepo.find.mockResolvedValueOnce([attack({ id: 1 })]);
    attacksRepo.find.mockResolvedValueOnce([
      attack({ id: 2, isUnderAttack: true }),
    ]);
    attacksRepo.find.mockResolvedValueOnce([defence({ id: 3 })]);
    attacksRepo.find.mockResolvedValueOnce([
      defence({ id: 4, isUnderAttack: true }),
    ]);
    const summary = await service.userAttackssummary(mockUser);

    expect(summary.lastFiveAttacksMade[0].attackerVillage).toMatchObject(
      atkPos,
    );
    expect(summary.lastFiveAttacksMade[0].defenderVillage).toMatchObject(
      defPos,
    );
    expect(summary.inProgress.made[0].attackerVillage).toMatchObject(atkPos);
    expect(summary.inProgress.made[0].defenderVillage).toMatchObject(defPos);

    expect(summary.lastFiveAttacksSuffered[0].attackerVillage).toMatchObject(
      defPos,
    );
    expect(summary.lastFiveAttacksSuffered[0].defenderVillage).toMatchObject(
      atkPos,
    );
    expect(summary.inProgress.suffered[0].attackerVillage).toMatchObject(
      defPos,
    );
    expect(summary.inProgress.suffered[0].defenderVillage).toMatchObject(
      atkPos,
    );
  });
});
