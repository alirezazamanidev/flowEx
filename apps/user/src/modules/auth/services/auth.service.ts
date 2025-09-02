import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { hashSync, compareSync } from 'bcrypt';
import { OtpService } from './otp.service';

import { MailerService } from './mailer.service';

import { TokenService } from './token.service';
import { UserEntity } from '../../user/entities/user.entity';

import { AuthMessages, NotFoundMessage, signUpDto } from '@app/common';

@Injectable()
export class AuthService{
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private readonly otpService: OtpService,
    private readonly mailerService: MailerService,
    private readonly tokenService: TokenService,
  ) {}

  async signUp(dto: signUpDto) {
    const { username, password, email } = dto;
    
    // بررسی وجود ایمیل
    const emailExist = await this.userRepository.exists({
      where: { email },
    });

    if (emailExist) {
      throw new UnauthorizedException({
        message: 'ایمیل قبلا ثبت شده است',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    // بررسی وجود یوزرنیم
    const usernameExist = await this.userRepository.exists({
      where: { username },
    });

    if (usernameExist)
      throw new UnauthorizedException({
        message: 'نام کاربری قبلا ثبت شده است',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    // create user
    const newUser = this.userRepository.create({
      username,
      hashedPassword: hashSync(password, 15),
      email,
      isEmailVerifyed: false,
    });
    await this.userRepository.save(newUser);
    // create otp
    const otpCode = await this.otpService.saveOtp(email);
    // send otp
    await this.mailerService.sendOtpForEmail(email, otpCode);
    return {
      message: AuthMessages.SentOtpCode,
    };
  }
  // async signIn(dto: SignInDto) {
  //   const { email, password } = dto;
  //   const user = await this.userRepository.findOne({ where: { email } });
  //   if (!user || !compareSync(password, user.hashedPassword))
  //     throw new RpcException({
  //       message: AuthMessages.InvalidCredentials,
  //       statusCode: HttpStatus.UNAUTHORIZED,
  //     });
  //   // create and send otp
  //   const otpCode = await this.otpService.saveOtp(email);
  //   await this.mailerService.sendOtpForEmail(email, otpCode);
  //   return {
  //     message: AuthMessages.SentOtpCode,
  //   };
  // }
  // async checkOtp(dto: CheckOtpDto) {
  //   const { email, otpCode } = dto;
  //   const user = await this.userRepository.findOne({ where: { email } });
  //   if (!user) throw new RpcException({message:NotFoundMessage.user})
  //   // verify otp
  //   await this.otpService.verify(user.email, otpCode);
  //   // update user
  //   if (!user.isEmailVerifyed)
  //     await this.userRepository.update(
  //       { id: user.id },
  //       { isEmailVerifyed: true },
  //     );
  //   // create jwt token
  //   const jwtToken = await this.tokenService.generateJwtToken({
  //     userId: user.id,
  //   });
  //   return {
  //     message: AuthMessages.Login,
  //     jwtToken,
  //   };
  // }
  // async validateJwtToken(token: string) {
  //   const { userId } = await this.tokenService.verifyJwtToken(token);
  //   const user = await this.userRepository.findOne({
  //     where: { id: userId },
  //     select: ['id', 'email', 'isEmailVerifyed', 'created_at'],
  //   });
  //   if (!user) throw new NotFoundException(NotFoundMessage.user);
  //   return user;
  // }
}
