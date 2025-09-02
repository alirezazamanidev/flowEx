import { Global, Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { clientsConfig } from '../../configs/client.config';

@Global()
@Module({
  imports: [ClientsModule.register(clientsConfig)],
  exports:[ClientsModule]
})
export class ClientGlobalModule {}
