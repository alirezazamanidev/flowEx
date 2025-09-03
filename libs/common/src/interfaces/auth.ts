import { Observable } from "rxjs";

export const AUTH_SERVICE_NAME = 'AuthService';

export const USER_SERVICE_NAME = 'UserService';
export const USER_PACKAGE_NAME = 'user';

export interface signUpDto {
  username: string;
  email: string;
  password: string;
}
export interface signInDto {
  email: string;
  password: string;
}
export interface AuthResponse {
  message: string;
}
export interface CheckOtpDto {
  email: string;
  otpCode: string;
}
export interface Empty {}
export interface VerifyOtpResponse {
  message: string;
  jwtToken:string
}

export interface ValidateJWtTokenDto{
  token:string
}
export interface AuthServiceClient {
  signUp(data: signUpDto): Promise<AuthResponse>;
  signIn(dto: signInDto): Promise<AuthResponse>;
  checkOtp(dto: CheckOtpDto): Promise<VerifyOtpResponse>;
  ValidateJwtToken(dto:ValidateJWtTokenDto):Observable<any>
}
