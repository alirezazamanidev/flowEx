import { Controller } from "@nestjs/common";
import { MarketService } from "./market.service";
import { GrpcMethod } from "@nestjs/microservices";
import type { CandleData, StreamCandlesRequest } from "@app/common";
import { Observable } from "rxjs";

@Controller()
export class MarketController {
    constructor(private marketService: MarketService) {}

    @GrpcMethod('MarketService', 'StreamCandles')
    streamCandles(data:StreamCandlesRequest):Observable<CandleData>{
        return this.marketService.StreamCandles(data);
    }

}