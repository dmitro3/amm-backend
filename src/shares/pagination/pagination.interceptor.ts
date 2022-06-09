import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class PaginationInterceptor implements NestInterceptor {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const page = Number(request.query.page || request.body.page || 1);
    const limit = Number(request.query.limit || request.body.limit || 20);
    request.query.skip = (page - 1) * limit;
    request.body.skip = (page - 1) * limit;
    return next.handle();
  }
}
