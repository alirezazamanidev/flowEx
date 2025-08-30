import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsPositive, IsString, Min, Max } from 'class-validator';
import { OrderSide } from '../enums/order.enum';

export class ReserveOrderDto {
  @ApiProperty({ description: 'نماد ارز، مثلاً BTC' })
  @IsNotEmpty()
  @IsString()
  currency: string;

  @ApiProperty({ description: 'ساید سفارش: خرید یا فروش', enum: OrderSide })
  @IsNotEmpty()
  @IsEnum(OrderSide)
  side: OrderSide;

  @ApiProperty({ description: 'قیمت هدف سفارش (Target Price)' })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  targetPrice: number;

  @ApiProperty({ description: 'درصد از موجودی کیف پول برای رزرو', minimum: 1, maximum: 100 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(100)
  percentOfWallet: number;
}
