import { DynamicModule, Global, Module } from "@nestjs/common";
import Redis from "ioredis";

export const REDIS_CLIENT='REDIS_CLIENT';
@Global()
@Module({

})
export class RedisModule {

    static forRoot():DynamicModule{
        return {
            module:RedisModule,
            providers:[
                {
                    provide:REDIS_CLIENT,
                    useFactory:()=>{
                        return new Redis(process.env.REDIS_URL)
                    }
                }
            ],
            exports:[REDIS_CLIENT]
        }

    }
}