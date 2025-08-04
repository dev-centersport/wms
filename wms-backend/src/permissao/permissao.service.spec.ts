import { Test, TestingModule } from '@nestjs/testing';
import { PermissaoService } from './permissao.service';

describe('PermissaoService', () => {
  let service: PermissaoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PermissaoService],
    }).compile();

    service = module.get<PermissaoService>(PermissaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
