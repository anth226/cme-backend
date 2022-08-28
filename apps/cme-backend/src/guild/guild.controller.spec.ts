import { Test } from '@nestjs/testing';
import { CreateGuildDto } from './dto/create-guild.dto';
import { InviteMembersToGuildDto } from './dto/invite-members-to-guild.dto';
import { GuildController } from './guild.controller';
import { GuildService } from './guild.service';

describe('GuildController', () => {
  let guildController: GuildController;
  const mockGuildService = {
    create: jest.fn((dto) => {
      return dto;
    }),
    invite: jest.fn((dto) => {
      return dto;
    }),
    leave: jest.fn((dto) => {
      return {};
    }),
    remove: jest.fn((dto) => {
      return {};
    }),
  };
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [GuildController],
      providers: [GuildService],
    })
      .overrideProvider(GuildService)
      .useValue(mockGuildService)
      .compile();

    guildController = module.get<GuildController>(GuildController);
  });

  it('should be defined', () => {
    expect(guildController).toBeDefined();
  });

  const createGuildDto = new CreateGuildDto();
  createGuildDto.name = 'test';
  it('should create a guild', async () => {
    expect(guildController.create({ user: { id: 1 } }, createGuildDto)).toEqual(
      createGuildDto,
    );
  });

  it('should invite members to guild', async () => {
    const inviteMembersToGuildDto = new InviteMembersToGuildDto();
    inviteMembersToGuildDto.members = [1, 2];
    expect(
      await guildController.invite(
        { user: { id: 1 } },
        inviteMembersToGuildDto,
      ),
    ).toEqual(inviteMembersToGuildDto);
  });

  it('should leave guild', async () => {
    expect(await guildController.leave({ user: { id: 1 } }, '1')).toEqual({});
  });

  it('should delete guild', async () => {
    expect(await guildController.remove({ user: { id: 1 } }, '1')).toEqual({});
  });
});
