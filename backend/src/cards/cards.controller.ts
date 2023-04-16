import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query
} from "@nestjs/common";
import { CardsService } from "./cards.service";
import { CreateCardDto } from "./dto/create-card.dto";
import { UpdateCardDto } from "./dto/update-card.dto";
import { AdminGuard } from "../auth/admin.guard";

@UseGuards(AdminGuard)
@Controller("cards")
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post()
  create(@Body() createCardDto: CreateCardDto) {
    return this.cardsService.create(createCardDto);
  }

  @Get()
  findAll(@Query("perPage") perPage: number, @Query("page") page: number) {
    return this.cardsService.findAll(perPage ?? 0, page ?? 0);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.cardsService.findOne(id);
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() updateCardDto: UpdateCardDto) {
    return await this.cardsService.update(id, updateCardDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    console.log("DELETING", id);
    return this.cardsService.remove(id);
  }
}
