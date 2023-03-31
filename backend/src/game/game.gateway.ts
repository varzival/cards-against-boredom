import { Body, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  WebSocketGateway,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket
} from "@nestjs/websockets";
import { Repository } from "typeorm";
import { Game } from "./entities/game.entity";
import { User } from "./entities/user.entity";
import { GameService } from "./game.service";

interface SelectCardsBody {
  cards: Array<number>;
}
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

  @SubscribeMessage("selectCards")
  async selectCards(
    @ConnectedSocket() client: any,
    @Body() body: SelectCardsBody
  ) {
    const game = await this.gameService.findOne();
    if (!game || !game.startedAt) throw new Error("Game has not started yet");
    if (!this.gameService.getQuestion(game))
      throw new Error("No question chosen");
    if (this.gameService.getQuestion(game).num !== body.cards?.length)
      throw new Error("Not the right amount of cards chosen");

    const user = await this.gameService.findUser(client.handshake.query.name);
    this.gameService.selectCard(user, body.cards);

    console.log("all cards chosen?", this.gameService.allCardsChosen(game));
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
      selectedCards: game.users
        .find((u) => u.name === userName)
        ?.handOfCards?.filter((c) => c.selected)
        .map((c) => c.order),
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
