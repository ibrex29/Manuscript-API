import { Test, TestingModule } from "@nestjs/testing";
import { ReplyController } from "./reply.controller";
import { ReplyService } from "./reply.service";

describe('TurnstileController', () => {
  let controller: ReplyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReplyController],
      providers: [ReplyService],
    }).compile();

    controller = module.get<ReplyController>(ReplyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
