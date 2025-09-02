import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
  ValidationPipe,
  ValidationError,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ValidationException } from '../exceptions/validation.exception';

@Injectable()
export class HttpValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors: ValidationError[]) => {
        const messages = errors.map((err) => {
          if (err.constraints) {
            return Object.values(err.constraints);
          }
          return `Validation failed for ${err.property}`;
        });
        return new ValidationException(messages.flat());
      },
    });
  }
}
