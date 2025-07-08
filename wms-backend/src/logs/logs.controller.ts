import { Body, Controller, Post } from '@nestjs/common';
import { LogsService } from './logs.service';

@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Post()
  createLog(@Body() logData: { [key: string]: any; action: string }) {
    this.logsService.logAction(logData);
    return { status: 'logged' };
  }
}
