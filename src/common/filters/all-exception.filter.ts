import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const statusCode = exception.status || HttpStatus.INTERNAL_SERVER_ERROR;

    const isDev = process.env.NODE_ENV === 'development'; // محیط توسعه

    const errorResponse: any = {
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message || 'Internal server error',
    };

    if (isDev && exception instanceof Error) {
      errorResponse.stack = exception.stack; 
    }

    response.status(statusCode).json(errorResponse);
  }
}