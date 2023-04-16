import { Injectable } from "@nestjs/common";
import { CreateQuestionDto } from "./dto/create-question.dto";
import { UpdateQuestionDto } from "./dto/update-question.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Question } from "./schemas/question.schema";
import BaseService from "../utils/BaseService";

@Injectable()
export class QuestionsService extends BaseService<
  CreateQuestionDto,
  UpdateQuestionDto,
  Question
> {
  constructor(@InjectModel(Question.name) model: Model<Question>) {
    super(model);
  }
}
