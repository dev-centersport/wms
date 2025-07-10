import { Injectable, Logger } from '@nestjs/common';
import path from 'path';
import fs from 'fs';

@Injectable()
export class LogsService {
  private readonly logger = new Logger(LogsService.name);
  // tail -f user-actions.log - para ver em tempo real
  private readonly logFilePath = path.join(__dirname, '../../user-actions.log');

  logAction(logData: { action: string; [key: string]: any }) {
    const logEntry = `${new Date().toISOString()} - ${JSON.stringify(logData)}\n`;

    this.logger.log(`Ação do usuário: ${logData.action}`);
    fs.appendFile(
      this.logFilePath,
      logEntry,
      (err: NodeJS.ErrnoException | null) => {
        if (err) this.logger.error('Erro ao escrever o arquivo de log', err);
      },
    );
  }
}
