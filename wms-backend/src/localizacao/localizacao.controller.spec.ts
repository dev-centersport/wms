import { Test, TestingModule } from '@nestjs/testing';
import { LocalizacaoController } from './localizacao.controller';
import { LocalizacaoService } from './localizacao.service';

describe('LocalizacaoController', () => {
  let controller: LocalizacaoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocalizacaoController],
      providers: [LocalizacaoService],
    }).compile();

    controller = module.get<LocalizacaoController>(LocalizacaoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
