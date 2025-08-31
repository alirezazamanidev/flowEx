import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ValidationException } from '../exceptions/validation.exception';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const request = host.switchToHttp().getRequest<Request>();
    const response = host.switchToHttp().getResponse<Response>();
    const statusCode =
      exception.getStatus() || HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse:any = {
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
    };
    if (exception instanceof ValidationException) {
      errorResponse.validationErrors = exception.validationErrors;
    }

    response.status(statusCode).json(errorResponse)
  }
}
