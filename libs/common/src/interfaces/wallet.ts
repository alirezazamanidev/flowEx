import { Empty } from './auth';
import { User } from './user';

export interface DepositDto {
  amount: string;
  user:User
}
export interface DepositResponse {
  gatewayUrl: string;
}
export interface verifyPaymentDto {
  authority: string;
  status: string;
}
export interface VerifyPaymentResponse {
  url:string
}

export interface LockFundsRequest{
  userId:string
  side:string
  currency:string
  percent:number
}
export interface LockFoudsResponse{
  success:boolean
  message:string
  amount?:number
}
export interface WalletServiceClient {
  Deposit(dto: DepositDto): Promise<DepositResponse>;
 verifyPayment(dto:verifyPaymentDto):Promise<VerifyPaymentResponse>
 lockFunds(dto:LockFundsRequest):Promise<LockFoudsResponse>
}
export const WALLET_PACKAGE_NAME = 'wallet';
export const WALLET_SERVICE_NAME = 'WalletService';
