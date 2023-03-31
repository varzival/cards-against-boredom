import { Body, Logger } from "@nestjs/common";
import {
  WebSocketGateway,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket
} from "@nestjs/websockets";
import { GameService } from "./game.service";
import { GameState } from "./schemas/game.schema";

interface SelectCardsBody {
  cards: Array<number>;
}

interface VoteBody {
  voteOption: number;
}
@WebSocketGateway()
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  clientByName: Map<any, string> = new Map<any, string>();

  private readonly logger = new Logger(GameGateway.name);

  constructor(private readonly gameService: GameService) {}

  @SubscribeMessage("selectCards")
  async selectCards(
    @ConnectedSocket() client: any,
    @Body() body: SelectCardsBody
  ) {
    const game = await this.gameService.findOne();
    const gameLean = await this.gameService.findOneLean();

    if (!gameLean || !gameLean.startedAt)
      throw new Error("Game has not started yet");
    if (gameLean.state !== GameState.SELECT_CARD)
      throw new Error(`Game is in the ${gameLean.state} State`);
    if (!gameLean.questions[0]) throw new Error("No question chosen");
    if (gameLean.questions[0].num !== body.cards?.length)
      throw new Error("Not the right amount of cards chosen");

    const user = game.users.find((u) => u.name === client.handshake.query.name);
    await this.gameService.selectCard(user, body.cards);
    await game.save();

    if (this.gameService.allCardsChosen(game)) {
      await this.gameService.setGameState(game, GameState.VOTE);
      await this.gameService.shuffleVoteOptions(game);
      await this.sendGameStateToAll();
    }

    await game.save();
  }

  @SubscribeMessage("vote")
  async vote(@ConnectedSocket() client: any, @Body() body: VoteBody) {
    const game = await this.gameService.findOne();
    const gameLean = await this.gameService.findOneLean();

    if (!gameLean || !gameLean.startedAt)
      throw new Error("Game has not started yet");
    if (gameLean.state !== GameState.VOTE)
      throw new Error(`Game is in the ${gameLean.state} State`);

    const user = game.users.find((u) => u.name === client.handshake.query.name);
    await this.gameService.vote(user, body.voteOption);
    await game.save();

    if (this.gameService.allVoted(game)) {
      await this.gameService.setGameState(game, GameState.SHOW_RESULTS);
      await this.sendGameStateToAll();
    }

    await game.save();
  }

  async getGameState(userName: string) {
    const game = await this.gameService.findOneLean();

    let voteOptions = null;
    if (game.state !== GameState.SELECT_CARD) {
      const usersOrdered = game.users.sort((a, b) => a.voteOrder - b.voteOrder);
      voteOptions = [];

      for (const user of usersOrdered) {
        const cards = user.selectedCards.map((i) => user.cards[i].text);
        voteOptions.push(cards);
      }
    }

    let voteResult = null;
    if (game.state !== GameState.SHOW_RESULTS) {
      // TODO
    }

    const user = game.users.find((u) => u.name === userName);

    if (!game) return null;
    return {
      players: game.users
        .sort((a, b) => {
          return b.points - a.points;
        })
        .map((user) => {
          return { name: user.name, points: user.points };
        }),
      hand: user?.cards?.map((c) => c.text),
      selectedCards: user?.selectedCards,
      question: game.questions[0]
        ? {
            text: game.questions[0].text,
            card_number: game.questions[0].num
          }
        : null,
      gameStarted: game.startedAt !== null,
      voteOptions,
      selectedVoteOption: user.votedFor,
      voteResult
    };
  }

  async sendGameStateToAll() {
    const game = await this.gameService.findOne();
    for (const [client, userName] of this.clientByName.entries()) {
      const user = game.users.find((u) => u.name === userName);
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

    const userName = client.handshake.query.name;
    //const user = await this.gameService.findUser(client.handshake.query.name);
    /*if (this.clientByName.get(user.name)) {
      console.error("User", user.name, "already exists");
      client.emit("error", user.name + " existiert bereits");
      return;
    }*/

    await this.gameService.assignUserToGame(userName, game);

    const gameState = await this.getGameState(userName);

    this.logger.log(`sending status to ${userName}, clientID ${client.id}`);

    client.emit("gameState", gameState);
    this.clientByName.set(client, client.handshake.query.name);
  }
}
