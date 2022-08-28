import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GuildMembers } from '../guild-members/guild-users.entity';
import { User } from '../users/user.entity';
import { CreateGuildDto } from './dto/create-guild.dto';
import { InviteMembersToGuildDto } from './dto/invite-members-to-guild.dto';
import { Guild } from './guild.entity';
import { GuildService } from './guild.service';

describe('GuildService', () => {
  const guildMembersObject = new GuildMembers();
  guildMembersObject.id = 1;
  guildMembersObject.isAdmin = true;
  const userObject = new User();
  userObject.id = 1;
  guildMembersObject.user = userObject;
  const relationsObj = {
    guildMembers: [guildMembersObject],
  };
  let guildService: GuildService;
  const mockGuildRepository = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((guild) => Promise.resolve(guild)),
    findOneOrFail: jest.fn(
      (id: number, obj: any = []) =>
        new Promise((resolve) => {
          const relations = obj.relations;
          // eslint-disable-next-line prefer-const
          let newObject = {};

          if (relations && relations?.length > 0) {
            relations.map((relation) => {
              newObject[relation] = relationsObj[relation];
            });
          }
          resolve({
            id: id,
            ...newObject,
          });
        }),
    ),
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
        GuildService,
        {
          provide: getRepositoryToken(Guild),
          useValue: mockGuildRepository,
        },
        {
          provide: getRepositoryToken(GuildMembers),
          useValue: mockGuildRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockGuildRepository,
        },
      ],
    }).compile();

    guildService = module.get<GuildService>(GuildService);
  });
  it('should be defined', () => {
    expect(guildService).toBeDefined();
  });

  it('should create guild', async () => {
    const dto = new CreateGuildDto();
    dto.name = 'Test';
    const guild = new Guild();
    guild.name = 'Test';
    // guild.id = 1;

    expect(await guildService.create(dto, { user: { id: 1 } })).toEqual(guild);
  });

  it('should invite user to guild', async () => {
    const guild = new Guild();
    guild.name = 'Test';

    const dto = new InviteMembersToGuildDto();
    dto.members = [2];
    dto.id = 1;
    const res = await guildService
      .invite(dto, { user: { id: 1 } })
      .then((res) => {
        return res;
      });
    // expect(res).toEqual(guild);
  });

  it('should leave guild', async () => {
    const res = await guildService.leave(1, { user: { id: 1 } }).then((res) => {
      return res;
    });
  });

  it('should remove guild', async () => {
    const res = await guildService.remove(1, 1).then((res) => {
      return res;
    });
  });
});
