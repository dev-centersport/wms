import { Test, TestingModule } from '@nestjs/testing';
import { AgrupamentoController } from './agrupamento.controller';
import { AgrupamentoService } from './agrupamento.service';

describe('AgrupamentoController', () => {
  let controller: AgrupamentoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgrupamentoController],
      providers: [AgrupamentoService],
    }).compile();

    controller = module.get<AgrupamentoController>(AgrupamentoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
