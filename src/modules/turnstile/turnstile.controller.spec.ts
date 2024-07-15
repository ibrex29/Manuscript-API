import { Test, TestingModule } from '@nestjs/testing';
import { TurnstileController } from './turnstile.controller';
import { TurnstileService } from './turnstile.service';

describe('TurnstileController', () => {
  let controller: TurnstileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TurnstileController],
      providers: [TurnstileService],
    }).compile();

    controller = module.get<TurnstileController>(TurnstileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
