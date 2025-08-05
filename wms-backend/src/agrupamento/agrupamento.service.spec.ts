import { Test, TestingModule } from '@nestjs/testing';
import { AgrupamentoService } from './agrupamento.service';

describe('AgrupamentoService', () => {
  let service: AgrupamentoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AgrupamentoService],
    }).compile();

    service = module.get<AgrupamentoService>(AgrupamentoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
