import { Test, TestingModule } from '@nestjs/testing';
import { ItemAuditoriaService } from './item_auditoria.service';

describe('ItemAuditoriaService', () => {
  let service: ItemAuditoriaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ItemAuditoriaService],
    }).compile();

    service = module.get<ItemAuditoriaService>(ItemAuditoriaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
