import { Test, TestingModule } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';
import { Repository } from 'typeorm';
import { Guild } from './guild.entity';
import { GuildService } from './guild.service';

describe('GuildService', () => {
  let service: GuildService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GuildService,
        {
          provide: 'GuildRepository',
          useValue: mock<Repository<Guild>>(),
        },
      ],
    }).compile();

    service = module.get<GuildService>(GuildService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
