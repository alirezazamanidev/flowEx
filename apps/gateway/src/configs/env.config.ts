import { ConfigModuleOptions } from '@nestjs/config';
import { join } from 'path';

export const EnvConfig: ConfigModuleOptions = {
  isGlobal: true,
  envFilePath: ['.env', join('apps/gateway', '.env')],
};
