import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ErrorCode } from 'src/shares/constants/errors.constant';

export interface Response<T> {
  data: T;
  metadata: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
}
@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        const metadata = {
          ...data.metadata,
          timestamp: new Date(),
        };
        delete data.metadata;
        return {
          code: ErrorCode.NoError,
          data: data.data || data,
          metadata: metadata,
        };
      }),
    );
  }
}
