import { Entity, Column, PrimaryColumn, ManyToOne } from "typeorm";
import { Card } from "./card.entity";
import { Game } from "./game.entity";

@Entity()
export class DeckOfCards {
  @PrimaryColumn()
  gameId: string;

  @PrimaryColumn()
  cardId: string;

  @Column({ type: "int", nullable: true })
  order: number;

  @ManyToOne(() => Game, (game) => game.deckOfCards, {
    onDelete: "CASCADE"
  })
  game: Game;

  @ManyToOne(() => Card, { onDelete: "CASCADE" })
  card: Card;
}
