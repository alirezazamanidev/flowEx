import { TransactionStatus } from "../enums/status.enum";
import { TransactionType } from "../enums/type.enum";

export class CreateTransactionDto {
  userId: string;
  amount: number;
  type: TransactionType;
  currency: string;
  status: TransactionStatus;
}
