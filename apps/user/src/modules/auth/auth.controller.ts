import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';


import { GrpcMethod } from '@nestjs/microservices';
import type { signUpDto, AuthResponse, signInDto, CheckOtpDto, ValidateJWtTokenDto } from '@app/common';
import { AuthService } from './services/auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @GrpcMethod('AuthService', 'SignUp')
  signUp(dto: signUpDto): Promise<AuthResponse> {
    return this.authService.signUp(dto);
  }

  @GrpcMethod('AuthService','SignIn')
  signin(@Body() dto: signInDto) {
    return this.authService.signIn(dto);
  }


  @GrpcMethod('AuthService','CheckOtp')
  checkOtp(@Body() dto: CheckOtpDto) {
    return this.authService.checkOtp(dto);
  }
  @GrpcMethod('AuthService','ValidateJwtToken')
  validateJwtToken(dto:ValidateJWtTokenDto){
    return this.authService.validateJwtToken(dto.token);
  }
}
