/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
// timezone.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TimezoneInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => this.convertDates(data)));
  }

  private convertDates(data: any): any {
    if (!data) return data;

    if (data instanceof Date) {
      return this.toSaoPauloTimezone(data);
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.convertDates(item));
    }

    if (typeof data === 'object') {
      const converted = { ...data };
      Object.keys(converted).forEach((key) => {
        if (converted[key] instanceof Date) {
          converted[key] = this.toSaoPauloTimezone(converted[key]);
        } else if (
          typeof converted[key] === 'object' &&
          converted[key] !== null
        ) {
          converted[key] = this.convertDates(converted[key]);
        }
      });
      return converted;
    }

    return data;
  }

  private toSaoPauloTimezone(date: Date): string {
    // Converte para timezone de São Paulo (UTC-3)
    const saoPauloOffset = -3 * 60; // -3 horas em minutos
    const utc = date.getTime() + date.getTimezoneOffset() * 60000;
    const saoPauloTime = new Date(utc + saoPauloOffset * 60000);

    // Retorna no formato ISO com timezone
    return saoPauloTime.toISOString();
  }
}
