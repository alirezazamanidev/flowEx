import { Observable } from "rxjs";


export const MARKET_PACKAGE_NAME = 'market';
export const MARKET_SERVICE_NAME = 'MarketService';

export interface StreamCandlesRequest {
    symbol: string;
    resolution: string;
}
export interface CandleData {
    symbol: string;
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}
export interface MarketServiceClient {
    streamCandles(request: StreamCandlesRequest): Observable<CandleData>;
}