import { AuthMessages } from '@app/common';
import {
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { REDIS_CLIENT } from 'apps/user/src/configs/redis.config';
import { randomInt } from 'crypto';
import Redis from 'ioredis';

@Injectable()
export class OtpService {
  private readonly OTP_EXPIRATION_MINUTES =
    process.env.OTP_EXPIRATION_MINUTES || 5;

  constructor(@Inject(REDIS_CLIENT) private redisClient: Redis) {}

  generateOtp(): string {
    return randomInt(100000, 999999).toString();
  }
  async saveOtp(key: string): Promise<string> {
    const otpCached = await this.redisClient.get(`otp:${key}`);
    if (otpCached) throw new RpcException({
      message: AuthMessages.OtpNotExpired,
      code: HttpStatus.UNAUTHORIZED,
      });
      const otpCode = this.generateOtp();
      
    await this.redisClient.setex(
      `otp:${key}`,
      this.OTP_EXPIRATION_MINUTES * 60,
      otpCode,
    );
    console.log(otpCode)
    return otpCode;
  }
  async verify(key: string, code: string) {
    const otpCached = await this.redisClient.get(`otp:${key}`);
    if (!otpCached)
       throw new RpcException({
        message: AuthMessages.OtpCodeExpired,
        code: HttpStatus.UNAUTHORIZED,
      });
    if (otpCached !== code)
      throw new RpcException({
        message: AuthMessages.OtpCodeInvalid,
        code: HttpStatus.UNAUTHORIZED,
      });
    return true;
  }
}
