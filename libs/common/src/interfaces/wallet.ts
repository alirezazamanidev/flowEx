export interface DepositDto {
  amount: string;
  userId: string;
}
export interface depositResponse {
  gatewayUrl: string;
}
export interface WalletService {
  deposit(dto: DepositDto): Promise<depositResponse>;
}
