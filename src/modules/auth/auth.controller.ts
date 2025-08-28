import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { SignUpDto } from './dtos/signUp.dto';
import { ContentTypeEnum } from 'src/common/enums/form.enum';
import { SignInDto } from './dtos/signIn.dto';
import { CheckOtpDto } from './dtos/check-otp.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'signUp' })
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes(ContentTypeEnum.Form, ContentTypeEnum.Json)
  signUp(@Body() dto: SignUpDto) {
    return this.authService.signUp(dto);
  }
  @ApiOperation({ summary: 'signIn' })
  @HttpCode(HttpStatus.OK)
  @ApiConsumes(ContentTypeEnum.Form, ContentTypeEnum.Json)
  @Post('signin')
  signin(@Body() dto: SignInDto) {
    return this.authService.signIn(dto);
  }

  @ApiOperation({ summary: 'check otp and verify email' })
  @HttpCode(HttpStatus.OK)
  @ApiConsumes(ContentTypeEnum.Form, ContentTypeEnum.Json)
  @Post('check-otp')
  checkOtp(@Body() dto: CheckOtpDto) {
    return this.authService.checkOtp(dto);
  }
}
