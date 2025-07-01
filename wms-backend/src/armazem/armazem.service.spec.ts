import { Test, TestingModule } from '@nestjs/testing';
import { ArmazemService } from './armazem.service';

describe('ArmazemService', () => {
  let service: ArmazemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ArmazemService],
    }).compile();

    service = module.get<ArmazemService>(ArmazemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
