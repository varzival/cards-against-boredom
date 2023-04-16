import { Injectable } from "@nestjs/common";
import { CreateQuestionDto } from "./dto/create-question.dto";
import { UpdateQuestionDto } from "./dto/update-question.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Question, QuestionDocument } from "./schemas/question.schema";

@Injectable()
export class QuestionsService {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<Question>
  ) {}

  create(createQuestionDto: CreateQuestionDto): Promise<QuestionDocument> {
    return this.questionModel.create(createQuestionDto);
  }

  findAll(perPage: number = 0, page: number = 0) {
    let query = this.questionModel.find({}).sort({ _id: -1 });

    if (perPage) {
      query = query.limit(perPage).skip(perPage * page);
    }

    return query.exec();
  }

  findOne(id: string) {
    return this.questionModel.findById(id).exec();
  }

  update(id: string, updateQuestionDto: UpdateQuestionDto) {
    return this.questionModel.findByIdAndUpdate(id, updateQuestionDto, {
      new: true
    });
  }

  remove(id: string) {
    return this.questionModel.deleteOne({ _id: id }).exec();
  }
}
