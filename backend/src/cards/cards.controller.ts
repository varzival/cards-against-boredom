import { Controller } from "@nestjs/common";
import { CardsService } from "./cards.service";
import { CreateCardDto } from "./dto/create-card.dto";
import { UpdateCardDto } from "./dto/update-card.dto";
import BaseController from "../utils/BaseController";

@Controller("cards")
export class CardsController extends BaseController<
  CreateCardDto,
  UpdateCardDto
> {
  constructor(readonly cardsService: CardsService) {
    super(cardsService);
  }
}
