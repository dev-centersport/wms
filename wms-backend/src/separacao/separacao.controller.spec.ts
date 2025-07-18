import { Test, TestingModule } from '@nestjs/testing';
import { SeparacaoController } from './separacao.controller';
import { SeparacaoService } from './separacao.service';

describe('SeparacaoController', () => {
  let controller: SeparacaoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SeparacaoController],
      providers: [SeparacaoService],
    }).compile();

    controller = module.get<SeparacaoController>(SeparacaoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
