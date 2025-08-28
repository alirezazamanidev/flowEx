import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class SignInDto {
  @ApiProperty({
    description: 'User email address',
    example: 'example@mail.com',
  })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
  @ApiProperty({
    description:
      'Password (8-16 chars, at least 1 uppercase, 1 lowercase, 1 number, 1 special char)',
    example: 'P@ssw0rd123',
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @Length(8, 16, { message: 'Password must be between 8 and 16 characters' })
  password: string;
}
