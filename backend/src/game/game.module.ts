import { Module } from "@nestjs/common";
import { GameService } from "./game.service";
import { GameGateway } from "./game.gateway";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Game } from "./entities/game.entity";
import { Card } from "./entities/card.entity";
import { User } from "./entities/user.entity";
import { Question } from "./entities/question.entity";
import { DeckOfCards } from "./entities/deckOfCards.entity";
import { DeckOfQuestions } from "./entities/deckOfQuestions.entity";
import { GameController } from "./game.controller";
import { HandOfCards } from "./entities/handOfCards.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Game]),
    TypeOrmModule.forFeature([Card]),
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Question]),
    TypeOrmModule.forFeature([DeckOfCards]),
    TypeOrmModule.forFeature([DeckOfQuestions]),
    TypeOrmModule.forFeature([HandOfCards])
  ],
  providers: [GameGateway, GameService],
  controllers: [GameController]
})
export class GameModule {}
