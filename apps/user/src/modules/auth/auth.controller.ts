import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './services/auth.service';

import { GrpcMethod } from '@nestjs/microservices';
import type { signUpDto, signUpResponse } from '@app/common';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @GrpcMethod('AuthService', 'SignUp')
  signUp(dto: signUpDto): Promise<signUpResponse> {
    return this.authService.signUp(dto);
  }

  // @ApiOperation({ summary: 'signIn' })
  // @HttpCode(HttpStatus.OK)
  // @ApiConsumes(ContentTypeEnum.Form, ContentTypeEnum.Json)
  // @Post('signin')
  // signin(@Body() dto: SignInDto) {
  //   return this.authService.signIn(dto);
  // }

  // @ApiOperation({ summary: 'check otp and verify email' })
  // @HttpCode(HttpStatus.OK)
  // @ApiConsumes(ContentTypeEnum.Form, ContentTypeEnum.Json)
  // @Post('check-otp')
  // checkOtp(@Body() dto: CheckOtpDto) {
  //   return this.authService.checkOtp(dto);
  // }
}
