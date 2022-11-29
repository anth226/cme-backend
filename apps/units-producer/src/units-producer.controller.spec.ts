import { Test, TestingModule } from '@nestjs/testing';
import { UnitsProducerController } from './units-producer.controller';
import { UnitsProducerService } from './units-producer.service';

describe('UnitsProducerController', () => {
  let unitsProducerController: UnitsProducerController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UnitsProducerController],
      providers: [UnitsProducerService],
    }).compile();

    unitsProducerController = app.get<UnitsProducerController>(
      UnitsProducerController,
    );
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(unitsProducerController.getHello()).toBe('Hello World!');
    });
  });
});
