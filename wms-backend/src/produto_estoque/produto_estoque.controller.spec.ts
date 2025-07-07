import { Test, TestingModule } from '@nestjs/testing';
import { ProdutoEstoqueController } from './produto_estoque.controller';
import { ProdutoEstoqueService } from './produto_estoque.service';

describe('ProdutoEstoqueController', () => {
  let controller: ProdutoEstoqueController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProdutoEstoqueController],
      providers: [ProdutoEstoqueService],
    }).compile();

    controller = module.get<ProdutoEstoqueController>(ProdutoEstoqueController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
