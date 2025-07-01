import { Test, TestingModule } from '@nestjs/testing';
import { ArmazemController } from './armazem.controller';
import { ArmazemService } from './armazem.service';

describe('ArmazemController', () => {
  let controller: ArmazemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArmazemController],
      providers: [ArmazemService],
    }).compile();

    controller = module.get<ArmazemController>(ArmazemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
