import {
  WebSocketGateway,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect
} from "@nestjs/websockets";
import { GameService } from "./game.service";

@WebSocketGateway()
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  clientByName: Map<string, any> = new Map<string, any>();

  constructor(private readonly gameService: GameService) {}

  @SubscribeMessage("createGame")
  create() {
    return this.gameService.create();
  }

  @SubscribeMessage("findGame")
  findOne() {
    return this.gameService.findOne();
  }

  async handleDisconnect(client: any, ...args: any[]) {
    console.log(
      "Disconnected from",
      client.handshake.query.name,
      "id:",
      client.id
    );
    this.clientByName.delete(client.handshake.query.name);
  }

  async handleConnection(client: any, ...args: any[]) {
    console.log("Connected to", client.handshake.query.name, "id:", client.id);
    const game = await this.gameService.findOne();

    const user = await this.gameService.findUser(client.handshake.query.name);
    this.gameService.assignUserToGame(user, game);

    const gameState = {
      players: game.users.sort((a, b) => {
        return b.points - a.points;
      }),
      hand: game.deckOfCards
        .sort((a, b) => {
          return a.order - b.order;
        })
        .map((doc) => doc.card)
        .map((card) => card.text),
      question: {
        text: game.deckOfQuestions[0]?.question?.text,
        card_number: game.deckOfQuestions[0]?.question?.num
      }
    };
    console.log(gameState);
    client.emit("gameState", gameState);
    this.clientByName.set(client.handshake.query.name, client);
  }
}
