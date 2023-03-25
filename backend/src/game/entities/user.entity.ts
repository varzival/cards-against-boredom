import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany
} from "typeorm";
import { Game } from "./game.entity";
import { HandOfCards } from "./handOfCards.entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ type: "int", default: "0" })
  points: number;

  @ManyToOne(() => Game, (game) => game.users, { onDelete: "CASCADE" })
  game: Game;

  @OneToMany(() => HandOfCards, (handOfCards) => handOfCards.user, {
    cascade: true
  })
  handOfCards: HandOfCards[];
}
