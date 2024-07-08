import { Test, TestingModule } from '@nestjs/testing';
import { ReviewerController } from './reviewer.controller';
import { ReviewerService } from './reviewer.service';

describe('ReviewerController', () => {
  let controller: ReviewerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewerController],
      providers: [ReviewerService],
    }).compile();

    controller = module.get<ReviewerController>(ReviewerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
