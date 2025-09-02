
export const AUTH_SERVICE_NAME = 'AuthService';


export const  USER_SERVICE_NAME = 'UserService';
export const USER_PACKAGE_NAME = 'user';

export  interface signUpDto {
  username:string
  email:string
  password:string
}
export interface signUpResponse {
  message:string
}
export interface Empty {}

export interface AuthServiceClient {
  signUp(data: signUpDto): Promise<signUpResponse>;
 
}