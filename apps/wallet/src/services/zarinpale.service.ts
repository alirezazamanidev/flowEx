import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { catchError, lastValueFrom, map } from "rxjs";

@Injectable()
export class ZarinPalService {
    constructor(private httpService: HttpService){}


  async sendRequest(amount:number,email:string){
      const options = {
          merchant_id: process.env.ZARINPAL_MERCHANT_ID,
          amount: amount*10,
          description:'شارژ کیف پول',
          callback_url: process.env.ZARINPAL_CALLBACK_URL,
          metadata: {
            email
          },
        };
        try {
          console.log(process.env.ZARINPAL_PAYMENT_REQUEST_URL)
          const result = await lastValueFrom(
            this.httpService
              .post(process.env.ZARINPAL_PAYMENT_REQUEST_URL, options)
              .pipe(
                map((res) => res.data),
                catchError((error) => {
                  // console.log(error);
    
                  throw new RpcException(
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
          
            throw new RpcException('خطا در اتصال به درگاه پرداخت');
          }
        } catch (error) {
       
          throw new RpcException('خطا در اتصال به درگاه پرداخت');
        }
  }
}