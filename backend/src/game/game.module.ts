import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { GameService } from "./game.service";
import { GameGateway } from "./game.gateway";
import { GameController } from "./game.controller";
import { DatabaseModule } from "../database/database.module";
import { Game, GameSchema } from "./schemas/game.schema";
import { Card, CardSchema } from "./schemas/card.schema";
import { Question, QuestionSchema } from "./schemas/question.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Game.name, schema: GameSchema },
      { name: Card.name, schema: CardSchema },
      { name: Question.name, schema: QuestionSchema }
    ]),
    DatabaseModule
  ],
  providers: [GameGateway, GameService],
  controllers: [GameController]
})
export class GameModule {}
