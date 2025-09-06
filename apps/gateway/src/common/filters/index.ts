import { ExceptionFilter } from '@nestjs/common';
import { 
  GrpcExceptionFiter
 } from './grpc-exception.filter';

export const getGlobalFilters = (): ExceptionFilter<any>[] => [
  
  new GrpcExceptionFiter()
];
