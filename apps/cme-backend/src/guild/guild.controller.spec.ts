import { Test } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';
import { CreateGuildDto } from './dto/create-guild.dto';
import { InviteMembersToGuildDto } from './dto/invite-members-to-guild.dto';
import { GuildController } from './guild.controller';
import { GuildService } from './guild.service';

describe('GuildColtroller', () => {
  let guildController: GuildController;
  let guildService: GuildService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [GuildController],
      providers: [
        {
          provide: GuildService,
          useValue: mock<GuildService>(),
        },
      ],
    }).compile();

    guildService = moduleRef.get<GuildService>(GuildService);
    guildController = moduleRef.get<GuildController>(GuildController);
  });

  describe('create', () => {
    it('should create a guild', async () => {
      const result: any = {};
      jest.spyOn(guildService, 'create').mockImplementation(() => result);
      const dto = new CreateGuildDto();
      dto.name = 'test';
      expect(
        await guildController.create(
          {
            user: {
              id: 1,
            },
          },
          dto,
        ),
      ).toBe(result);
    });

    // should invite members to guild
    it('should invite members to guild', async () => {
      const result: any = {
        id: 1,
        name: 'string',
      };
      jest.spyOn(guildService, 'invite').mockImplementation(() => result);
      const dto = new InviteMembersToGuildDto();
      dto.members = [1, 2];
      expect(
        await guildController.invite(
          {
            user: {
              id: 1,
            },
          },
          dto,
        ),
      ).toBe(result);
    });
  });

  // leave guild
  it('should leave guild', async () => {
    const result: any = {
      id: 1,
      name: 'string',
    };
    jest.spyOn(guildService, 'leave').mockImplementation(() => result);
    const dto = new InviteMembersToGuildDto();
    dto.members = [1, 2];
    expect(
      await guildController.leave(
        {
          user: {
            id: 1,
          },
        },
        '1',
      ),
    ).toBe(result);
  });

  // delete guild
  it('should delete guild', async () => {
    const result: any = {
      id: 1,
      name: 'string',
    };
    jest.spyOn(guildService, 'remove').mockImplementation(() => result);
    const dto = new InviteMembersToGuildDto();
    dto.members = [1, 2];
    expect(
      await guildController.remove(
        {
          user: {
            id: 1,
          },
        },
        '1',
      ),
    ).toBe(result);
  });
});
