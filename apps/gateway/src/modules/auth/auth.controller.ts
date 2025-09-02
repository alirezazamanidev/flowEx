import { Body, Controller, Get, HttpCode, HttpStatus, Inject, OnModuleInit, Post } from '@nestjs/common';

import { ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { SignUpDto } from './dtos/signUp.dto';


import { ContentTypeEnum } from '../../common/enums/form.enum';

import { GrpcPackageNames } from '../../common/enums/grpc.enum';
import { AUTH_SERVICE_NAME, AuthServiceClient } from '@app/common';
import type{ ClientGrpc } from '@nestjs/microservices';

@Controller('auth')
export class AuthController implements OnModuleInit {
private authServiceClient: AuthServiceClient;

  constructor(@Inject(GrpcPackageNames.USER) private client: ClientGrpc) {}
  onModuleInit() {
    this.authServiceClient = this.client.getService<AuthServiceClient>(AUTH_SERVICE_NAME);

  }
 
  @ApiOperation({ summary: 'signUp' })
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes(ContentTypeEnum.Form, ContentTypeEnum.Json)
  signUp(@Body() dto: SignUpDto) {
    return this.authServiceClient.signUp(dto);
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
