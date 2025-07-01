import { Test, TestingModule } from '@nestjs/testing';
import { TipoLocalizacaoService } from './tipo_localizacao.service';

describe('TipoLocalizacaoService', () => {
  let service: TipoLocalizacaoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TipoLocalizacaoService],
    }).compile();

    service = module.get<TipoLocalizacaoService>(TipoLocalizacaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
