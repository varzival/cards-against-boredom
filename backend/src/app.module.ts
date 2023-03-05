import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GameModule } from "./game/game.module";
import { AuthModule } from "./auth/auth.module";
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      host: "localhost",
      port: 5432,
      username: "admin",
      password: "postgres",
      database: "cards-against-kern",
      entities: [__dirname + "/../**/*.entity{.ts,.js}"],
      synchronize: false
    }),
    GameModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
