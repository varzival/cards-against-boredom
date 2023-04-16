import { Controller } from "@nestjs/common";
import { QuestionsService } from "./questions.service";
import { CreateQuestionDto } from "./dto/create-question.dto";
import { UpdateQuestionDto } from "./dto/update-question.dto";
import BaseController from "../utils/BaseController";

@Controller("questions")
export class QuestionsController extends BaseController<
  CreateQuestionDto,
  UpdateQuestionDto
> {
  constructor(readonly questionsService: QuestionsService) {
    super(questionsService);
  }
}
