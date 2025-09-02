import { Global, Module } from '@nestjs/common';
import { ZarinPalService } from './services/zarinPal.service';
import { HttpModule } from '@nestjs/axios';

@Global()
@Module({
  imports:[HttpModule.register({timeout:10000})],
  providers: [ZarinPalService],
  exports:[ZarinPalService,HttpModule]
})
export class HttpCustomModule {}
