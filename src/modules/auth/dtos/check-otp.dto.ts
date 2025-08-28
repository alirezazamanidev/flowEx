import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class CheckOtpDto {
  @ApiProperty({
    description: 'User email address',
    example: 'example@mail.com',
  })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
  @ApiProperty({})
  @IsString()
  @IsNotEmpty()
  @Length(6,6)
  otpCode:string
}
