import { Body, Controller, Post } from '@nestjs/common';
import { Auth } from '../auth/decorators/auth.decourator';
import { OrderService } from './services/order.service';
import { ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { ReserveOrderDto } from './dtos/order.dto';
import { ContentTypeEnum } from 'src/common/enums/form.enum';

@Auth()
@Controller('order')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @ApiOperation({ summary: 'reserve order' })
  @Post('reserve-order')
  @ApiConsumes(ContentTypeEnum.Form, ContentTypeEnum.Json)
  reserveOrder(@Body() dto: ReserveOrderDto) {
    return this.orderService.reserveOrder(dto);
  }
}
