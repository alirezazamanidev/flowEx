import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsPositive } from "class-validator";


export class DepositDto {

  @ApiProperty({ description: 'The amount to deposit' })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amount: number;
}