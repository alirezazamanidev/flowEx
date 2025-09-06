export const ORDER_PACKAGE_NAME = 'order';
export const ORDER_SERVICE_NAME = 'OrderService';

export interface CreateOrderRequest {
  userId: string;
  currency: string;

  side: string;

  targetPrice: number;

  percentOfWallet: number;
}
export interface CreateOrderResponse {
  orderId: string;
  message:string
  success: boolean;
}
export interface OrderServiceClient {
  createOrder(dto: CreateOrderRequest): Promise<CreateOrderResponse>;
}
