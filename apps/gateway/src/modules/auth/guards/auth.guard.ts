import { AUTH_SERVICE_NAME, AuthMessages, AuthServiceClient } from '@app/common';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { GrpcPackageNames } from 'apps/gateway/src/common/enums/grpc.enum';
import { isJWT } from 'class-validator';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
    private authServiceClient: AuthServiceClient;
    
      constructor(@Inject(GrpcPackageNames.USER) private client: ClientGrpc) {}
      onModuleInit() {
        this.authServiceClient = this.client.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
    
      }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const authHeader = request.headers?.authorization;
    if (!authHeader) throw new UnauthorizedException(AuthMessages.LoginAgain);
    const [bearer, token] = authHeader.split(' ');
    if (bearer.toLocaleLowerCase() !== 'bearer' || !token || !isJWT(token))
      throw new UnauthorizedException(AuthMessages.LoginAgain);

    request.user=await this.authServiceClient.ValidateJwtToken({token});
    
    return true;
  }
}
