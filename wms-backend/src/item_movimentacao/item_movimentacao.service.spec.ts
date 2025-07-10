import { Test, TestingModule } from '@nestjs/testing';
import { ItemMovimentacaoService } from './item_movimentacao.service';

describe('ItemMovimentacaoService', () => {
  let service: ItemMovimentacaoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ItemMovimentacaoService],
    }).compile();

    service = module.get<ItemMovimentacaoService>(ItemMovimentacaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
