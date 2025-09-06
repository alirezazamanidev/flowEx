// rpc-error.interceptor.ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  Observable,
  TimeoutError,
  catchError,
  throwError,
  timeout,
} from 'rxjs';

@Injectable()
export class RpcErrorInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RpcErrorInterceptor.name);
  private readonly DEFAULT_TIMEOUT = 60000; // 60 seconds

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(this.DEFAULT_TIMEOUT),
      catchError((error) => {
        console.log(error)
        if (error instanceof TimeoutError) {
          return throwError(
            () => new HttpException(
              'Service timeout - Request took too long to process',
              HttpStatus.GATEWAY_TIMEOUT,
            ),
          );
        }

        // Handle structured errors from microservices
        if (this.isStructuredError(error)) {
          return throwError(
            () => new HttpException(error.message, error.statusCode),
          );
        }

        // Handle RPC-specific errors
        if (error?.code === 'UNAVAILABLE') {
          return throwError(
            () => new HttpException(
              'Service temporarily unavailable',
              HttpStatus.SERVICE_UNAVAILABLE,
            ),
          );
        }

        // Default error handling
        return throwError(
          () => new HttpException(
            'Internal server error occurred while processing request',
            HttpStatus.INTERNAL_SERVER_ERROR,
          ),
        );
      }),
    );
  }

  private isStructuredError(error: any): boolean {
    return error?.statusCode && 
           error?.message && 
           typeof error.statusCode === 'number' &&
           error.statusCode >= 400 && 
           error.statusCode < 600;
  }
}