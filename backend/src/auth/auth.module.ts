import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthGateway } from "./auth.gateway";
import { AuthController } from './auth.controller';

@Module({
  providers: [AuthService, AuthGateway],
  exports: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
