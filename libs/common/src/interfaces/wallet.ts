import { Empty } from './auth';
import { User } from './user';

export interface DepositDto {
  amount: string;
  user:User
}
export interface DepositResponse {
  gatewayUrl: string;
}
export interface WalletServiceClient {
  Deposit(dto: DepositDto): Promise<DepositResponse>;
 
}
export const WALLET_PACKAGE_NAME = 'wallet';
export const WALLET_SERVICE_NAME = 'WalletService';
