import { Test, TestingModule } from '@nestjs/testing';
import { FileiraController } from './fileira.controller';
import { FileiraService } from './fileira.service';

describe('FileiraController', () => {
  let controller: FileiraController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileiraController],
      providers: [FileiraService],
    }).compile();

    controller = module.get<FileiraController>(FileiraController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
