import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { Repository } from 'typeorm';
import { GuildMembers } from '../guild-members/guild-users.entity';
import { User } from '../users/user.entity';
import { Guild } from './guild.entity';
import { GuildService } from './guild.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateGuildDto } from './dto/create-guild.dto';
import { InviteMembersToGuildDto } from './dto/invite-members-to-guild.dto';

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
                name: 'mehedi',
              };
            },
            findOneOrFail: jest.fn(),
            delete: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(GuildMembers),
          useValue: {
            save: jest.fn(),
            findOneOrFail: jest.fn(),
            delete: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            save: jest.fn(),
            findOneOrFail: jest.fn(),
            delete: jest.fn(),
            remove: jest.fn(),
            findByIds: jest.fn(),
          },
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
  it('should create a guild', async () => {
    const dto = new CreateGuildDto();
    dto.name = 'Test';
    const guild = new Guild();
    guild.name = 'Test';
    guild.id = 1;
    guild.createdAt = new Date();
    guild.updatedAt = new Date();

    jest
      .spyOn(guildRepository, 'save')
      .mockImplementationOnce(() => of(guild) as any);

    jest
      .spyOn(userRepository, 'findOneOrFail')
      .mockImplementationOnce(() => of({}) as any);

    jest.spyOn(guildMembersRepository, 'save').mockImplementationOnce(() => {
      return {
        name: 'mehedi',
      } as any;
    });

    const res = await service
      .create(dto, { user: { id: 'test' } })
      .then((res) => {
        return res;
      });
    // expect(res).toBe(guild);
  });
  it('should invite user to guild', async () => {
    const guild = new Guild();
    guild.name = 'Test';
    guild.id = 1;
    guild.createdAt = new Date();
    guild.updatedAt = new Date();

    jest
      .spyOn(guildRepository, 'findOneOrFail')
      .mockImplementationOnce(() => of(guild) as any);

    jest
      .spyOn(userRepository, 'findOneOrFail')
      .mockImplementationOnce(() => of({}) as any);

    jest
      .spyOn(userRepository, 'findByIds')
      .mockImplementationOnce(() => of([]) as any);

    jest.spyOn(guildMembersRepository, 'save').mockImplementationOnce(() => {
      return {
        name: 'mehedi',
      } as any;
    });

    const dto = new InviteMembersToGuildDto();
    dto.members = [2];
    dto.id = 1;
    const res = await service.invite(dto, { user: { id: '1' } }).then((res) => {
      return res;
    });
    // expect(res).toBe(guild);
  });

  it('should leave guild', async () => {
    const guild = new Guild();
    guild.name = 'Test';
    guild.id = 1;
    guild.createdAt = new Date();
    guild.updatedAt = new Date();

    jest
      .spyOn(guildRepository, 'findOneOrFail')
      .mockImplementationOnce(() => of(guild) as any);
    jest
      .spyOn(userRepository, 'findOneOrFail')
      .mockImplementationOnce(() => of({}) as any);

    jest
      .spyOn(guildRepository, 'delete')
      .mockImplementationOnce(() => of({}) as any);

    jest
      .spyOn(guildRepository, 'remove')
      .mockImplementationOnce(() => of({}) as any);

    jest
      .spyOn(guildMembersRepository, 'remove')
      .mockImplementationOnce(() => of({}) as any);

    const guildId = 1;
    const userId = 1;
    const res = await service.leave(guildId, userId).then((res) => {
      return res;
    });
    // expect(res).toBe(guild);
  });

  it('should remove guild', async () => {
    const guild = new Guild();
    guild.name = 'Test';
    guild.id = 1;
    guild.createdAt = new Date();
    guild.updatedAt = new Date();

    jest
      .spyOn(guildRepository, 'findOneOrFail')
      .mockImplementationOnce(() => of(guild) as any);
    jest
      .spyOn(userRepository, 'findOneOrFail')
      .mockImplementationOnce(() => of({}) as any);

    jest
      .spyOn(guildMembersRepository, 'delete')
      .mockImplementationOnce(() => of({}) as any);

    jest
      .spyOn(guildRepository, 'remove')
      .mockImplementationOnce(() => of({}) as any);

    const guildId = 1;
    const requesterId = 1;
    const res = await service.remove(guildId, requesterId).then((res) => {
      return res;
    });
    // expect(res).toBe(guild);
  });
});
