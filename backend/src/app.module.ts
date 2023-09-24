import { Module } from "@nestjs/common";
import { GameModule } from "./game/game.module";
import { AuthModule } from "./auth/auth.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule } from "@nestjs/config";
import { CardsModule } from "./cards/cards.module";
import { QuestionsModule } from "./questions/questions.module";

@Module({
  imports: [
    ConfigModule.forRoot(),
    GameModule,
    AuthModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "../dist/")
    }),
    MongooseModule.forRoot(process.env.MONGO_DB_CONNECTION_STRING),
    CardsModule,
    QuestionsModule
  ]
})
export class AppModule {}
