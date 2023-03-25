import { Controller, Post, UseGuards } from "@nestjs/common";
import { AdminGuard } from "../auth/admin.guard";
import { GameGateway } from "./game.gateway";
import { GameService } from "./game.service";

@Controller("game")
export class GameController {
  constructor(
    private gameService: GameService,
    private gameGateway: GameGateway
  ) {}

  @UseGuards(AdminGuard)
  @Post("start")
  async start() {
    const game = await this.gameService.create();
    await this.gameService.start(game);
    await this.gameGateway.sendGameStateToAll();
  }

  @UseGuards(AdminGuard)
  @Post("stop")
  async stop() {
    const game = await this.gameService.findOne();
    await this.gameService.stop(game);
    await this.gameGateway.sendGameStateToAll();
  }
}
