import {
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query
} from "@nestjs/common";
import { AdminGuard } from "../auth/admin.guard";
import { IBaseService } from "./BaseService";

@UseGuards(AdminGuard)
abstract class BaseController<CreateDTO, UpdateDTO, Document> {
  private service: IBaseService<CreateDTO, UpdateDTO, Document>;

  @Post()
  create(@Body() createDto: CreateDTO) {
    return this.service.create(createDto);
  }

  @Get()
  findAll(@Query("perPage") perPage: number, @Query("page") page: number) {
    return this.service.findAll(perPage ?? 0, page ?? 0);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.service.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateDto: UpdateDTO) {
    return this.service.update(id, updateDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.service.remove(id);
  }
}

export default BaseController;
