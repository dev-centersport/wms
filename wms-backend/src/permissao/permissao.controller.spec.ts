import { Test, TestingModule } from '@nestjs/testing';
import { PermissaoController } from './permissao.controller';
import { PermissaoService } from './permissao.service';

describe('PermissaoController', () => {
  let controller: PermissaoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissaoController],
      providers: [PermissaoService],
    }).compile();

    controller = module.get<PermissaoController>(PermissaoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
