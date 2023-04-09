import { Body, Logger } from "@nestjs/common";
import {
  WebSocketGateway,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket
} from "@nestjs/websockets";
import { GameService } from "./game.service";
import { Game, GameState } from "./schemas/game.schema";

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
    let gameLean = await this.gameService.findOneLean();

    if (!gameLean || !gameLean.startedAt)
      throw new Error("Game has not started yet");
    if (gameLean.state !== GameState.SELECT_CARD)
      throw new Error(`Game is in the ${gameLean.state} State`);
    if (!gameLean.questions[0]) throw new Error("No question chosen");

    let uniqueCards = body?.cards;
    if (!uniqueCards) throw new Error("No cards chosen");
    uniqueCards = [...new Set(uniqueCards)];
    if (uniqueCards.length !== body.cards?.length)
      throw new Error("Duplicate cards chosen");

    if (gameLean.questions[0].num !== uniqueCards.length)
      throw new Error("Not the right amount of cards chosen");

    const user = game.users.find((u) => u.name === client.handshake.query.name);
    await this.gameService.selectCard(user, uniqueCards);
    await game.save();

    gameLean = await this.gameService.findOneLean();

    // MUST BE lean in allCardsChosen
    // TODO find a unified way
    if (this.gameService.allCardsChosen(gameLean)) {
      await this.gameService.setGameState(game, GameState.VOTE);
      this.gameService.shuffleVoteOptions(game);
      await game.save();
      await this.sendGameStateToAll();
    } else {
      await this.sendPlayersToAll();
    }
  }

  @SubscribeMessage("vote")
  async vote(@ConnectedSocket() client: any, @Body() body: VoteBody) {
    const game = await this.gameService.findOne();

    if (!game || !game.startedAt) throw new Error("Game has not started yet");
    if (game.state !== GameState.VOTE)
      throw new Error(`Game is in the ${game.state} State`);

    const user = game.users.find((u) => u.name === client.handshake.query.name);
    await this.gameService.vote(user, body.voteOption);
    await game.save();

    if (this.gameService.allVoted(game)) {
      await this.gameService.setGameState(game, GameState.SHOW_RESULTS);
      await this.gameService.calculatePoints(game);
      await game.save();
      await this.sendGameStateToAll();
    } else {
      await this.sendPlayersToAll();
    }
  }

  @SubscribeMessage("continue")
  async continue(@ConnectedSocket() client: any) {
    const game = await this.gameService.findOne();

    if (!game || !game.startedAt) throw new Error("Game has not started yet");
    if (game.state !== GameState.SHOW_RESULTS)
      throw new Error(`Game is in the ${game.state} State`);

    const user = game.users.find((u) => u.name === client.handshake.query.name);
    user.continue = true;
    await game.save();

    if (this.gameService.allContinue(game)) {
      await this.gameService.resetGameRound(game);
      await this.gameService.setGameState(game, GameState.SELECT_CARD);
      await game.save();
      await this.sendGameStateToAll();
    } else {
      await this.sendPlayersToAll();
    }
  }

  @SubscribeMessage("logout")
  async logout(@ConnectedSocket() client: any) {
    // TODO handle selected options (keep until round reset?)
    const game = await this.gameService.findOne();
    const userName = client.handshake.query.name;

    await this.gameService.deleteUserFromGame(userName, game);
    await game.save();

    const clientsToDisconnect = [];
    for (const [
      existingClient,
      existingUserName
    ] of this.clientByName.entries()) {
      if (existingUserName === userName)
        clientsToDisconnect.push(existingClient);
    }

    for (const cl of clientsToDisconnect) {
      cl.disconnect(0);
    }

    await this.sendPlayersToAll();
  }

  getPlayers(game: Game) {
    const activeUsers = new Set<string>();
    for (const userName of this.clientByName.values()) {
      activeUsers.add(userName);
    }

    const selectionMade = new Set<string>();
    if (game.questions?.length && game.users?.length) {
      for (const user of game.users) {
        switch (game.state) {
          case GameState.SELECT_CARD:
            if (user.selectedCards.length >= game.questions[0].num)
              selectionMade.add(user.name);
            break;
          case GameState.VOTE:
            if (user.votedFor !== null) selectionMade.add(user.name);
            break;
          case GameState.SHOW_RESULTS:
            if (user.continue) selectionMade.add(user.name);
            break;
          default:
            break;
        }
      }
    }

    return game.users
      .sort((a, b) => {
        return b.points - a.points;
      })
      .map((user) => {
        return {
          name: user.name,
          points: user.points,
          active: activeUsers.has(user.name),
          selectionMade: selectionMade.has(user.name)
        };
      });
  }

  async getGameState(userName: string) {
    const game = await this.gameService.findOneLean();

    let voteOptions = null;
    const usersOrdered = game.users.sort((a, b) => a.voteOrder - b.voteOrder);
    if (game.state !== GameState.SELECT_CARD) {
      voteOptions = [];

      for (const user of usersOrdered) {
        const cards = user.selectedCards.map((i) => user.cards[i].text);
        voteOptions.push(cards);
      }
    }

    let voteResult = null;
    if (game.state === GameState.SHOW_RESULTS) {
      voteResult = [];

      for (const user of usersOrdered) {
        const votedFor = usersOrdered
          .filter((u) => u.votedFor === user.voteOrder)
          .map((u) => u.name);
        voteResult.push({
          players: votedFor,
          vote: user.voteOrder,
          owner: user.name
        });
      }
    }

    const user = game.users?.find((u) => u.name === userName);

    if (!game) return null;
    return {
      gameState: game.state,
      players: this.getPlayers(game),
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
      selectedVoteOption: user?.votedFor,
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

  async sendPlayersToAll() {
    const game = await this.gameService.findOneLean();
    for (const [client, userName] of this.clientByName.entries()) {
      const user = game.users.find((u) => u.name === userName);
      if (!user) {
        this.logger.error(`User ${userName} is not connected`);
        continue;
      }

      client.emit("gameState", {
        players: this.getPlayers(game)
      });
    }
  }

  async handleDisconnect(client: any, ...args: any[]) {
    this.logger.log(
      `Disconnected from ${client.handshake.query.name}, id: ${client.id}, from ${client.handshake.address}`
    );
    this.clientByName.delete(client);

    await this.sendGameStateToAll();
  }

  async handleConnection(client: any, ...args: any[]) {
    this.logger.log(
      `Connected to ${client.handshake.query.name}, id ${client.id}, from ${client.handshake.address}`
    );
    const game = await this.gameService.findOneOrCreate();

    const userName = client.handshake.query.name;
    const user = game.users.find((u) => u.name === userName);
    for (const [
      existingClient,
      existingUserName
    ] of this.clientByName.entries()) {
      if (
        existingUserName === userName &&
        existingClient.handshake.address !== client.handshake.address
      ) {
        this.logger.error(`User ${user.name} already exists`);
        throw new Error("User exists already");
      }
    }

    // TODO deal cards if necessary, make vote options correct

    await this.gameService.assignUserToGame(userName, game);

    const gameState = await this.getGameState(userName);

    client.emit("gameState", gameState);
    this.clientByName.set(client, client.handshake.query.name);

    await this.sendGameStateToAll();
  }
}
