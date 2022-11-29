import { Test, TestingModule } from '@nestjs/testing';
import { GameRulesService } from './game-rules.service';

describe('GameRulesService', () => {
  let service: GameRulesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameRulesService],
    }).compile();

    service = module.get<GameRulesService>(GameRulesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
