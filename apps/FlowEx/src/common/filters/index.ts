import { ExceptionFilter } from '@nestjs/common';
import { AllExceptionFilter } from './all-exception.filter';
import { HttpExceptionFilter } from './http-exception.filter';
export const getGlobalFilters = (): ExceptionFilter<any>[] => [
  new AllExceptionFilter(),
  new HttpExceptionFilter(),
];
