import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Game } from "./game.entity";

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
}
