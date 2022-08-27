import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { Repository } from 'typeorm';
import { GuildMembers } from '../guild-members/guild-users.entity';
import { User } from '../users/user.entity';
import { Guild } from './guild.entity';
import { GuildService } from './guild.service';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('GuildService', () => {
  let service: GuildService;
  let guildRepository: Repository<Guild>;
  let userRepository: Repository<User>;
  let guildMembersRepository: Repository<GuildMembers>;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GuildService,
        {
          provide: getRepositoryToken(Guild),
          useValue: {
            save: () => {
              return {
                name: 'faisal',
              };
            },
          },
        },
        {
          provide: getRepositoryToken(GuildMembers),
          useValue: { save: jest.fn() },
        },
        {
          provide: getRepositoryToken(User),
          useValue: { findOneOrFail: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<GuildService>(GuildService);
    guildRepository = module.get<Repository<Guild>>(getRepositoryToken(Guild));
    guildMembersRepository = module.get<Repository<GuildMembers>>(
      getRepositoryToken(GuildMembers),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a guild', async () => {
    const guild = new Guild();
    guild.name = 'Test';
    guild.id = 1;
    guild.createdAt = new Date();
    guild.updatedAt = new Date();

    jest
      .spyOn(guildRepository, 'save')
      .mockImplementationOnce(() => of(guild) as any);

    jest.spyOn(userRepository, 'findOneOrFail').mockImplementationOnce(
      () =>
        of({
          // return a mock user
        }) as any,
    );

    jest.spyOn(guildMembersRepository, 'save').mockImplementationOnce(() => {
      return {
        name: 'faisal',
      } as any;
    });

    const response = await service.create({} as any, { user: { id: 'test' } });
    console.log(response);
    // expect(service.create(guild)).toBe(guild);
  });
});
