import { Test, TestingModule } from '@nestjs/testing';
import { ItemMovimentacaoController } from './item_movimentacao.controller';
import { ItemMovimentacaoService } from './item_movimentacao.service';

describe('ItemMovimentacaoController', () => {
  let controller: ItemMovimentacaoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemMovimentacaoController],
      providers: [ItemMovimentacaoService],
    }).compile();

    controller = module.get<ItemMovimentacaoController>(ItemMovimentacaoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
