import { model, Schema } from "mongoose";

// CARD

export interface ICard {
  text: string;
}

const cardSchema = new Schema<ICard>({
  text: { type: String, required: true },
});

export const CardModel = model<ICard>("Card", cardSchema);

// QUESTION

export interface IQuestion {
  text: string;
  num: number;
}

const questionSchema = new Schema<IQuestion>({
  text: { type: String, required: true },
  num: { type: Number, required: true },
});

export const QuestionModel = model<IQuestion>("Question", questionSchema);
