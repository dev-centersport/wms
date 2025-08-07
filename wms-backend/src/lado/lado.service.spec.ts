import { Test, TestingModule } from '@nestjs/testing';
import { LadoService } from './lado.service';

describe('LadoService', () => {
  let service: LadoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LadoService],
    }).compile();

    service = module.get<LadoService>(LadoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
