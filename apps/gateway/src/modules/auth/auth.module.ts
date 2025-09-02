import { Global, Module } from '@nestjs/common';

import { AuthController } from './auth.controller';

@Global()
@Module({
  
  controllers: [AuthController],

})
export class AuthModule {}
