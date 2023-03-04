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

@Module({
  imports: [
    TypeOrmModule.forFeature([Game]),
    TypeOrmModule.forFeature([Card]),
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Question]),
    TypeOrmModule.forFeature([DeckOfCards]),
    TypeOrmModule.forFeature([DeckOfQuestions])
  ],
  providers: [GameGateway, GameService]
})
export class GameModule {}
