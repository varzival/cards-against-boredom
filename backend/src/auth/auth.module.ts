import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthGateway } from "./auth.gateway";
import { AuthController } from "./auth.controller";
import { UsersService } from "../users/users.service";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [UsersModule],
  providers: [AuthService, AuthGateway, UsersService],
  exports: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
