import { Transport, ClientsModuleOptions } from '@nestjs/microservices';
import { GrpcPackageNames } from '../common/enums/grpc.enum';
import { join } from 'path';
import { USER_PACKAGE_NAME } from '@app/common';

export const clientsConfig: ClientsModuleOptions = [
  {
    name: GrpcPackageNames.USER,
    transport: Transport.GRPC,
    options: {
      package: USER_PACKAGE_NAME,
      protoPath: join(process.cwd(), 'proto/user.proto'),
    },
  },
];
