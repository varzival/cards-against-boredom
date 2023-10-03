import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { AdminGuard } from "../auth/admin.guard";
import { GameGateway } from "./game.gateway";
import { GameService } from "./game.service";
import { UsersService } from "../users/users.service";

@Controller("game")
export class GameController {
  constructor(
    private gameService: GameService,
    private gameGateway: GameGateway,
    private usersService: UsersService
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

  @UseGuards(AdminGuard)
  @Post("kick")
  async kick(@Body("name") name: string) {
    const game = await this.gameService.findOne();
    await this.gameGateway.sendKick(name);
    await this.usersService.deleteUserFromGame(name, game);
    await this.gameGateway.sendPlayersToAll();
  }
}
