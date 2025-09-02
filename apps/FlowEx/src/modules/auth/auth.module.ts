import { Global, Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { OtpService } from './services/otp.service';
import { MailerService } from './services/mailer.service';
import { TokenService } from './services/token.service';
import { JwtModule } from '@nestjs/jwt';
@Global()
@Module({
  imports: [UserModule, JwtModule.register({ global: true })],
  controllers: [AuthController],
  providers: [AuthService, OtpService, MailerService, TokenService],
  exports: [AuthService],
})
export class AuthModule {}
