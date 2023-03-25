import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GameModule } from "./game/game.module";
import { AuthModule } from "./auth/auth.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";

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
    AuthModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "../../../frontend/dist/")
    })
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
