import { Test, TestingModule } from '@nestjs/testing';
import { TipoLocalizacaoController } from './tipo_localizacao.controller';
import { TipoLocalizacaoService } from './tipo_localizacao.service';

describe('TipoLocalizacaoController', () => {
  let controller: TipoLocalizacaoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TipoLocalizacaoController],
      providers: [TipoLocalizacaoService],
    }).compile();

    controller = module.get<TipoLocalizacaoController>(TipoLocalizacaoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
