import { Test, TestingModule } from '@nestjs/testing';
import { ItemAuditoriaController } from './item_auditoria.controller';
import { ItemAuditoriaService } from './item_auditoria.service';

describe('ItemAuditoriaController', () => {
  let controller: ItemAuditoriaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemAuditoriaController],
      providers: [ItemAuditoriaService],
    }).compile();

    controller = module.get<ItemAuditoriaController>(ItemAuditoriaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
