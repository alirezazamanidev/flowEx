import { Body, Controller, Post } from '@nestjs/common';
import { Auth } from '../auth/decorators/auth.decourator';
import { OrderService } from './services/order.service';
import { ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { LimitOrderDto, MarketOrderDto } from './dtos/order.dto';
import { ContentTypeEnum } from 'src/common/enums/form.enum';

@Auth()
@Controller('order')
export class OrderController {
  constructor(private orderService: OrderService) {}

  
  @ApiOperation({ summary: 'reserve order' })
  @Post('limit-order')
  @ApiConsumes(ContentTypeEnum.Form, ContentTypeEnum.Json)
  limitOrder(@Body() dto: LimitOrderDto) {
    return this.orderService.placeLimitOrder(dto);
  }
}
