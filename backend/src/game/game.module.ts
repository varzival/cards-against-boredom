import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { GameService } from "./game.service";
import { GameGateway } from "./game.gateway";
import { GameController } from "./game.controller";
import { Game, GameSchema } from "./schemas/game.schema";
import { Card, CardSchema } from "../cards/schemas/card.schema";
import { Question, QuestionSchema } from "../questions/schemas/question.schema";
import { UsersModule } from "../users/users.module";
import { UsersService } from "../users/users.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Game.name, schema: GameSchema },
      { name: Card.name, schema: CardSchema },
      { name: Question.name, schema: QuestionSchema }
    ]),
    UsersModule
  ],
  providers: [GameGateway, GameService, UsersService],
  controllers: [GameController]
})
export class GameModule {}
