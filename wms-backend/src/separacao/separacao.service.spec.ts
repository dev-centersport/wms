import { Test, TestingModule } from '@nestjs/testing';
import { SeparacaoService } from './separacao.service';

describe('SeparacaoService', () => {
  let service: SeparacaoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SeparacaoService],
    }).compile();

    service = module.get<SeparacaoService>(SeparacaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
