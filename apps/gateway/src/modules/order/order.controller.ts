import {
  ORDER_SERVICE_NAME,
  OrderServiceClient,
} from '@app/common/interfaces/order';
import {
  Body,
  Controller,
  Inject,
  OnModuleInit,
  Post,
  Req,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { ContentTypeEnum } from '../../common/enums/form.enum';
import { CreateOrderDto } from './dto/order.dto';
import { ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decourator';
import type { Request } from 'express';
import { GrpcPackageNames } from '@app/common';

@Controller('order')
@Auth()
export class OrderController implements OnModuleInit {
  private orderServiceClient: OrderServiceClient;
  constructor(
    @Inject(GrpcPackageNames.ORDER) private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.orderServiceClient= this.client.getService<OrderServiceClient>(ORDER_SERVICE_NAME);
  }
  @ApiOperation({ summary: 'create order' })
  @Post('create')
  @ApiConsumes(ContentTypeEnum.Form, ContentTypeEnum.Json)
  create(@Body() dto: CreateOrderDto, @Req() req: Request) {
    return this.orderServiceClient.createOrder({
      userId: req.user.id,
    ...dto
      
    });
  }
}
