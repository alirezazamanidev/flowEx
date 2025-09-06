import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { throwError } from "rxjs";
@Catch(RpcException)
export class RpcExceptionFilter implements ExceptionFilter {

    catch(exception: RpcException, host: ArgumentsHost) {
    
      return  throwError(()=>exception.getError())
    }
}