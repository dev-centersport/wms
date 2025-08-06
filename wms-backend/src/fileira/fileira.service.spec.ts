import { Test, TestingModule } from '@nestjs/testing';
import { FileiraService } from './fileira.service';

describe('FileiraService', () => {
  let service: FileiraService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileiraService],
    }).compile();

    service = module.get<FileiraService>(FileiraService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
