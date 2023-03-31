import { Prop, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes } from "mongoose";

export type CardDocument = HydratedDocument<Card>;

export class Card {
  @Prop({ required: true })
  text: string;
}

export const CardSchema = SchemaFactory.createForClass(Card);
