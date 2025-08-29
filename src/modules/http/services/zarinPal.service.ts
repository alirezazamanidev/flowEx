import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { catchError, lastValueFrom, map } from 'rxjs';

@Injectable()
export class ZarinPalService {
  private logger = new Logger(ZarinPalService.name);
  constructor(private readonly httpService: HttpService) {}

  async sendRequest({ amount, email }: { amount: number; email: string }) {
    const options = {
      merchant_id: process.env.ZARINPAL_MERCHANT_ID,
      amount: amount,
      callback_url: process.env.ZARINPAL_CALLBACK_URL,
      metadata: {
        email,
      },
    };
    try {
      const result = await lastValueFrom(
        this.httpService
          .post(process.env.ZARINPAL_PAYMENT_REQUEST_URL, options)
          .pipe(
            map((res) => res.data),
            catchError((error) => {
              console.log(error);

              this.logger.error(
                `Zarinpal API error: ${error.message}`,
                error.stack,
              );
              throw new InternalServerErrorException(
                'خطا در اتصال به درگاه پرداخت',
              );
            }),
          ),
      );
      if (result.data && result.data.authority) {
        return {
          authority: result.data.authority,
          code: result.data.code,
        };
      } else {
        this.logger.error(
          `Zarinpal error: Invalid response format: ${JSON.stringify(result)}`,
        );
        throw new InternalServerErrorException('خطا در اتصال به درگاه پرداخت');
      }
    } catch (error) {
      this.logger.error(
        `Zarinpal payment request error: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('خطا در اتصال به درگاه پرداخت');
    }
  }
}
