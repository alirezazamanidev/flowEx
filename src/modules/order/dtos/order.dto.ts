import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsPositive, IsString, Min, Max, IsOptional } from 'class-validator';
import { OrderSide, OrderType } from '../enums/order.enum';

export class ReserveOrderDto {
  @ApiProperty({ description: 'نماد ارز، مثلاً BTC' })
  @IsNotEmpty()
  @IsString()
  currency: string;
  @ApiProperty({ description: 'نوع سفارش', enum: OrderType })
  @IsNotEmpty()
  @IsEnum(OrderType)
  type: OrderType;
  @ApiProperty({ description: 'ساید سفارش: خرید یا فروش', enum: OrderSide })
  @IsNotEmpty()
  @IsEnum(OrderSide)
  side: OrderSide;

  @ApiPropertyOptional({ description: 'قیمت هدف سفارش (Target Price)' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  targetPrice?: number;

  @ApiProperty({ description: 'درصد از موجودی کیف پول برای رزرو', minimum: 1, maximum: 100 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(100)
  percentOfWallet: number;

  @ApiPropertyOptional({description:'حد ضرر'})
  @IsOptional()
  @IsNumber()
  @IsPositive()
  stopLoss?: number;

  @ApiPropertyOptional({description:"حد سود"})
 @IsOptional()
  @IsNumber()
  @IsPositive()
  takeProfit?: number;

}
