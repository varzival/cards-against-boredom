import { Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  WebSocketGateway,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect
} from "@nestjs/websockets";
import { Repository } from "typeorm";
import { Game } from "./entities/game.entity";
import { User } from "./entities/user.entity";
import { GameService } from "./game.service";

@WebSocketGateway()
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  clientByName: Map<any, string> = new Map<any, string>();

  private readonly logger = new Logger(GameGateway.name);

  constructor(
    private readonly gameService: GameService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  @SubscribeMessage("createGame")
  create() {
    return this.gameService.create();
  }

  @SubscribeMessage("findGame")
  findOne() {
    return this.gameService.findOne();
  }

  async getGameState(userName: string) {
    const game = await this.gameService.findOne();
    if (!game) return null;
    return {
      players: game.users
        .sort((a, b) => {
          return b.points - a.points;
        })
        .map((user) => {
          return { name: user.name, points: user.points };
        }),
      hand: game.users
        .find((u) => u.name === userName)
        ?.handOfCards?.sort((a, b) => {
          return a.order - b.order;
        })
        .map((hoc) => hoc.card.text),
      question: game.deckOfQuestions[0]?.question
        ? {
            text: game.deckOfQuestions[0].question.text,
            card_number: game.deckOfQuestions[0].question.num
          }
        : null,
      gameStarted: game.startedAt !== null
    };
  }

  async sendGameStateToAll() {
    for (const [client, userName] of this.clientByName.entries()) {
      const user = (
        await this.userRepository.find({ where: { name: userName } })
      )[0];
      if (!user) {
        this.logger.error(`User ${userName} is not connected`);
        continue;
      }
      const gameState = await this.getGameState(user.name);
      if (gameState) {
        this.logger.log(
          `sending status to ${user.name}, clientID ${client.id}`
        );
        client.emit("gameState", gameState);
      }
    }
  }

  async handleDisconnect(client: any, ...args: any[]) {
    console.log(
      "Disconnected from",
      client.handshake.query.name,
      "id:",
      client.id
    );
    this.clientByName.delete(client);
  }

  async handleConnection(client: any, ...args: any[]) {
    this.logger.log(
      `Connected to ${client.handshake.query.name}, id ${client.id}, from ${client.handshake.address}`
    );
    const game = await this.gameService.findOneOrCreate();

    const user = await this.gameService.findUser(client.handshake.query.name);
    /*if (this.clientByName.get(user.name)) {
      console.error("User", user.name, "already exists");
      client.emit("error", user.name + " existiert bereits");
      return;
    }*/
    this.gameService.assignUserToGame(user, game);

    const gameState = await this.getGameState(user.name);

    this.logger.log(`sending status to ${user.name}, clientID ${client.id}`);

    client.emit("gameState", gameState);
    this.clientByName.set(client, client.handshake.query.name);
  }
}
