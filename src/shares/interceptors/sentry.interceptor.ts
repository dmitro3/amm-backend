import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  // eslint-disable-next-line
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) => {
        console.log(err);
        if (err instanceof HttpException) {
          return throwError(err);
        }
        Sentry.captureException(err);
        return throwError(
          new InternalServerErrorException('Chúng tôi rất tiếc khi hệ thống FCX gặp lỗi. Vui lòng thử lại sau.'),
        );
      }),
    );
  }
}
