import { Injectable } from "@nestjs/common";
import { CreateCardDto } from "./dto/create-card.dto";
import { UpdateCardDto } from "./dto/update-card.dto";
import { Card } from "./schemas/card.schema";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import BaseService from "../utils/BaseService";

@Injectable()
export class CardsService extends BaseService<
  CreateCardDto,
  UpdateCardDto,
  Card
> {
  constructor(@InjectModel(Card.name) model: Model<Card>) {
    super(model);
  }
}
