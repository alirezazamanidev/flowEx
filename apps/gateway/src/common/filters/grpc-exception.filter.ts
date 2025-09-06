import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Request, Response } from 'express';
import { status } from '@grpc/grpc-js';
@Catch()
export class GrpcExceptionFiter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const request = host.switchToHttp().getRequest<Request>();
    const response = host.switchToHttp().getResponse<Response>();
    let statusCode = 0;
    let message = '';

    if (typeof exception === 'object') {
      statusCode =
        exception?.code ||
        exception?.statusCode ||
        HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.details;
    }
    response.status(statusCode).json({
      message,
      statusCode,
      timestams:new Date(),
      path: request.url,
    });
  }
}
