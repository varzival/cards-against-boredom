import { Prop, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes } from "mongoose";

export type QuestionDocument = HydratedDocument<Question>;

export class Question {
  @Prop({ required: true })
  text: string;

  @Prop({ required: true })
  num: number;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
