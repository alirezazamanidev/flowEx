import { Controller } from '@nestjs/common';
import { MarketService } from './services/market.service';

@Controller('market')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}
}
