import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, Length, Matches } from "class-validator";

export class SignUpDto {
  @ApiProperty({
    description: 'User name of the user',
    example: 'John Doe',
  })
  @IsString({ message: 'User name must be a string' })
  @IsNotEmpty({ message: 'User name is required' })
  @Length(2, 50, { message: 'User name must be between 2 and 50 characters' })
  username: string;

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
  @Matches(/(?=.*[a-z])/, {
    message: 'Password must contain at least one lowercase letter',
  })
  @Matches(/(?=.*[A-Z])/, {
    message: 'Password must contain at least one uppercase letter',
  })
  @Matches(/(?=.*\d)/, { message: 'Password must contain at least one number' })
  @Matches(/(?=.*[@$!%*?&])/, {
    message: 'Password must contain at least one special character (@$!%*?&)',
  })
  password: string;
}
