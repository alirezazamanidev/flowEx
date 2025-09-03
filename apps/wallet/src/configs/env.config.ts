import { ConfigModuleOptions } from "@nestjs/config";
import { join } from "path";

export const EnvConfig: ConfigModuleOptions = {
  isGlobal: true,
  envFilePath: [join(process.cwd(), '.env'), join('apps/wallet', '.env')],
};
