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

    if (typeof data === 'object') {
      Object.keys(data).forEach((key) => {
        if (data[key] instanceof Date) {
          data[key] = this.toSaoPauloTimezone(data[key]);
        } else if (typeof data[key] === 'object') {
          this.convertDates(data[key]);
        }
      });
    }

    return data;
  }

  private toSaoPauloTimezone(date: Date): string {
    return new Date(date.getTime() - 3 * 60 * 60 * 1000).toISOString();
    // Ou use bibliotecas como date-fns-tz para mais precisão
  }
}
