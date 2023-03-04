import { Entity, Column, PrimaryColumn, ManyToOne } from "typeorm";
import { Question } from "./question.entity";
import { Game } from "./game.entity";

@Entity()
export class DeckOfQuestions {
  @PrimaryColumn()
  gameId: string;

  @PrimaryColumn()
  questionId: string;

  @Column({ type: "int", nullable: true })
  order: number;

  @ManyToOne(() => Game, (game) => game.deckOfCards, {
    onDelete: "CASCADE"
  })
  game: Game;

  @ManyToOne(() => Question, { onDelete: "CASCADE" })
  question: Question;
}
