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
      amount: amount*10,
      description:'شارژ کیف پول',
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
              console.log(error.response);

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
      
        throw new InternalServerErrorException('خطا در اتصال به درگاه پرداخت');
      }
    } catch (error) {
   
      throw new InternalServerErrorException('خطا در اتصال به درگاه پرداخت');
    }
  }
   async verify(authority: string, amount: number) {
        const options = {
            merchant_id: process.env.ZARINPAL_MERCHANT_ID,
            authority,
            amount: amount * 10 // Convert to Rial
        };
        
        try {
            const result = await lastValueFrom(
                this.httpService
                  .post(process.env.ZARINPAL_PAYMENT_VERIFY_URL, options)
                  .pipe(
                    map((res) => {
                     
                      return res.data;
                    }),
                    catchError(error => {
                     
                      throw new InternalServerErrorException("خطا در تایید پرداخت");
                    })
                  )
            );
            
            // Check if result has the expected structure
            if (!result || !result.data) {
         
                return { success: false, refId: null, code: -1 };
            }
            
            return {
                success: result.data.code === 100 || result.data.code === 101,
               
                code: result.data.code
            };
        } catch (error) {
            this.logger.error(`Zarinpal verification error: ${error.message}`, error.stack);
            // Return a failure result instead of throwing an exception
            return { success: false, refId: null, code: -1 };
        }
    }
}
