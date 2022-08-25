import { Test, TestingModule } from '@nestjs/testing';
import { GuildMembersController } from './guild-members.controller';

describe('GuildMembersController', () => {
  let controller: GuildMembersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GuildMembersController],
    }).compile();

    controller = module.get<GuildMembersController>(GuildMembersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
