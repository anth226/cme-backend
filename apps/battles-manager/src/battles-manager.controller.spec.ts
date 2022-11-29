import { Test, TestingModule } from '@nestjs/testing';
import { BattlesManagerController } from './battles-manager.controller';
import { BattlesManagerService } from './battles-manager.service';

describe('BattlesManagerController', () => {
  let battlesManagerController: BattlesManagerController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [BattlesManagerController],
      providers: [BattlesManagerService],
    }).compile();

    battlesManagerController = app.get<BattlesManagerController>(
      BattlesManagerController,
    );
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(battlesManagerController.getHello()).toBe('Hello World!');
    });
  });
});
