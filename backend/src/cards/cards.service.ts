import { Injectable } from "@nestjs/common";
import { CreateCardDto } from "./dto/create-card.dto";
import { UpdateCardDto } from "./dto/update-card.dto";
import { Card, CardDocument } from "./schemas/card.schema";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class CardsService {
  constructor(@InjectModel(Card.name) private cardModel: Model<Card>) {}

  async create(createCardDto: CreateCardDto): Promise<CardDocument> {
    return this.cardModel.create({
      text: createCardDto.text
    });
  }

  async findAll(
    perPage: number = 0,
    page: number = 0
  ): Promise<Array<CardDocument>> {
    let query = this.cardModel.find({});

    if (perPage) {
      query = query.limit(perPage).skip(perPage * page);
    }

    return query.exec();
  }

  async findOne(id: string): Promise<CardDocument> {
    return this.cardModel.findById(id).exec();
  }

  async update(id: string, updateCardDto: UpdateCardDto): Promise<any> {
    return await this.cardModel.findByIdAndUpdate(id, updateCardDto, {
      new: true
    });
  }

  async remove(id: string): Promise<any> {
    return this.cardModel.deleteOne({ _id: id });
  }
}
