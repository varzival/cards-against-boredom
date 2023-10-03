import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Game, GameSchema } from "../game/schemas/game.schema";
import { UsersService } from "./users.service";

const mongooseModule = MongooseModule.forFeature([
  { name: Game.name, schema: GameSchema }
]);

@Module({
  imports: [mongooseModule],
  providers: [UsersService],
  exports: [UsersService, mongooseModule]
})
export class UsersModule {}
