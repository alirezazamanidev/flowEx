import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { isJWT } from 'class-validator';
import { Request } from 'express';
import { AuthMessages } from 'src/common/enums/messages.enum';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly authService: AuthService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const authHeader = request.headers?.authorization;
    if (!authHeader) throw new UnauthorizedException(AuthMessages.LoginAgain);
    const [bearer, token] = authHeader.split(' ');
    if (bearer.toLocaleLowerCase() !== 'bearer' || !token || !isJWT(token))
      throw new UnauthorizedException(AuthMessages.LoginAgain);

    request.user=await this.authService.validateJwtToken(token);
    
    return true;
  }
}
