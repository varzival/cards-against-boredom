import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { DeckOfCards } from "./deckOfCards.entity";
import { DeckOfQuestions } from "./deckOfQuestions.entity";
import { User } from "./user.entity";

export enum GameState {
  SELECT_CARD = "SELECT_CARD",
  VOTE = "VOTE",
  SHOW_RESULTS = "SHOW_RESULTS"
}

@Entity()
export class Game {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "timestamptz", nullable: true })
  startedAt: Date;

  @Column({ type: "enum", enum: GameState, default: GameState.SELECT_CARD })
  gameState: GameState;

  @OneToMany(() => DeckOfCards, (deckOfCards) => deckOfCards.game, {
    cascade: true
  })
  deckOfCards: DeckOfCards[];

  @OneToMany(() => DeckOfQuestions, (deckOfQuestions) => deckOfQuestions.game, {
    cascade: true
  })
  deckOfQuestions: DeckOfQuestions[];

  @OneToMany(() => User, (user) => user.game, { cascade: true })
  users: User[];
}
