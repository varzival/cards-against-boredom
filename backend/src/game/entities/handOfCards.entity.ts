import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { Card } from "./card.entity";
import { User } from "./user.entity";

@Entity()
export class HandOfCards {
  @PrimaryColumn()
  userId: string;

  @PrimaryColumn()
  cardId: string;

  @PrimaryColumn({ type: "int" })
  order: number;

  @Column({ type: "int", nullable: true })
  selected: number;

  @ManyToOne(() => User, (user) => user.handOfCards, {
    onDelete: "CASCADE"
  })
  user: User;

  @ManyToOne(() => Card, { onDelete: "CASCADE" })
  card: Card;
}
