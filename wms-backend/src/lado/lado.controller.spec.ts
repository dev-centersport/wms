import { Test, TestingModule } from '@nestjs/testing';
import { LadoController } from './lado.controller';
import { LadoService } from './lado.service';

describe('LadoController', () => {
  let controller: LadoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LadoController],
      providers: [LadoService],
    }).compile();

    controller = module.get<LadoController>(LadoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
