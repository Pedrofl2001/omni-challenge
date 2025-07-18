import { Routes } from "@nestjs/core";
import { UserModule } from "./modules/user/user.module";
import { TransferModule } from "./modules/transfer/transfer.module";

export const routes: Routes = [
  {
    path: 'users',
    module: UserModule,
  },
  {
    path: 'transfers',
    module: TransferModule,
  }
];