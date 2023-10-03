import { Body, Logger } from "@nestjs/common";
import {
  WebSocketGateway,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  WsException,
  WebSocketServer
} from "@nestjs/websockets";
import { GameService } from "./game.service";
import { Game, GameState } from "./schemas/game.schema";
import { Server } from "socket.io";
import { UsersService } from "../users/users.service";

interface SelectCardsBody {
  cards: Array<number>;
}

interface VoteBody {
  voteOption: number;
}
@WebSocketGateway()
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  webSocketServer: Server;

  private readonly logger = new Logger(GameGateway.name);

  constructor(
    private readonly gameService: GameService,
    private readonly usersService: UsersService
  ) {}

  connectedClients() {
    return this.webSocketServer.sockets.sockets;
  }

  @SubscribeMessage("selectCards")
  async selectCards(
    @ConnectedSocket() client: any,
    @Body() body: SelectCardsBody
  ) {
    const game = await this.gameService.findOne();
    let gameLean = await this.gameService.findOneLean();

    if (!gameLean || !gameLean.startedAt)
      throw new WsException("Game has not started yet");
    if (gameLean.state !== GameState.SELECT_CARD)
      throw new WsException(`Game is in the ${gameLean.state} State`);
    if (!gameLean.questions[0]) throw new WsException("No question chosen");

    let uniqueCards = body?.cards;
    if (!uniqueCards) throw new WsException("No cards chosen");
    uniqueCards = [...new Set(uniqueCards)];
    if (uniqueCards.length !== body.cards?.length)
      throw new WsException("Duplicate cards chosen");

    if (gameLean.questions[0].num !== uniqueCards.length)
      throw new WsException("Not the right amount of cards chosen");

    const user = game.users?.find(
      (u) => u.name === client.handshake.query.name
    );
    if (!user) throw new WsException("No user found");

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

    if (!game || !game.startedAt)
      throw new WsException("Game has not started yet");
    if (game.state !== GameState.VOTE)
      throw new WsException(`Game is in the ${game.state} State`);

    const user = game.users?.find(
      (u) => u.name === client.handshake.query.name
    );
    if (!user) throw new WsException("No user found");
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

    if (!game || !game.startedAt)
      throw new WsException("Game has not started yet");
    if (game.state !== GameState.SHOW_RESULTS)
      throw new WsException(`Game is in the ${game.state} State`);

    const user = game.users?.find(
      (u) => u.name === client.handshake.query.name
    );
    if (!user) throw new WsException("No user found");
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

    await this.usersService.deleteUserFromGame(userName, game);
    await game.save();

    const clientsToDisconnect = [];
    for (const socket of this.connectedClients().values()) {
      if (socket.handshake.query.name === userName)
        clientsToDisconnect.push(socket);
    }

    for (const cl of clientsToDisconnect) {
      cl.disconnect(0);
    }

    await this.sendPlayersToAll();
  }

  getPlayers(game: Game) {
    const activeUsers = new Set<string>();
    for (const socket of this.connectedClients().values()) {
      activeUsers.add(socket.handshake.query.name as string);
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
    const usersOrdered = game.users?.sort((a, b) => a.voteOrder - b.voteOrder);
    if (game.state !== GameState.SELECT_CARD) {
      voteOptions = [];

      if (usersOrdered) {
        for (const user of usersOrdered) {
          const cards = user.selectedCards.map((i) => user.cards[i].text);
          voteOptions.push(cards);
        }
      }
    }

    let voteResult = null;
    if (game.state === GameState.SHOW_RESULTS) {
      voteResult = [];

      if (usersOrdered) {
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
    const game = await this.gameService.findOneOrCreate();
    for (const [clientID, socket] of this.connectedClients().entries()) {
      const user = game.users?.find(
        (u) => u.name === socket.handshake.query.name
      );
      if (!user) {
        this.logger.error(
          `User ${socket.handshake.query.name} is not connected`
        );
        continue;
      }
      const gameState = await this.getGameState(user.name);
      if (gameState) {
        this.logger.log(`sending status to ${user.name}, clientID ${clientID}`);
        socket.emit("gameState", gameState);
      }
    }
  }

  async sendPlayersToAll() {
    const game = await this.gameService.findOneLean();
    for (const socket of this.connectedClients().values()) {
      const user = game.users?.find(
        (u) => u.name === socket.handshake.query.name
      );
      if (!user) {
        this.logger.error(
          `User ${socket.handshake.query.name} is not connected`
        );
        continue;
      }

      socket.emit("gameState", {
        players: this.getPlayers(game)
      });
    }
  }

  async sendKick(name: string) {
    for (const socket of this.connectedClients().values()) {
      if (socket.handshake.query.name === name) {
        socket.emit("kick");
        socket.disconnect(true);
      }
    }
  }

  async handleDisconnect(client: any, ...args: any[]) {
    this.logger.log(
      `Disconnected from ${client.handshake.query.name}, id: ${client.id}, from ${client.handshake.address}`
    );

    await this.sendGameStateToAll();
  }

  async handleConnection(client: any, ...args: any[]) {
    this.logger.log(
      `Connected to ${client.handshake.query.name}, id ${client.id}, from ${client.handshake.address}`
    );

    let game = await this.gameService.findOneOrCreate();

    const userName = client.handshake.query.name;
    const uniqueId = client.handshake.query.uniqueId;
    if (!userName || !uniqueId) {
      throw new WsException(
        `Wrong websocket handshake data ${userName} ${uniqueId}`
      );
    }

    const assigned = await this.usersService.assignUserToGame(
      userName,
      uniqueId,
      game
    );
    if (assigned && game.startedAt) {
      game = await this.gameService.findOne();
      const user = game.users?.find((u) => u.name === userName);
      if (!user) throw new WsException("No user found");
      await this.gameService.dealCards(game, user);
      await game.save();
    } else if (!assigned) {
      const user = game.users?.find((u) => u.name === userName);
      if (!user) throw new WsException("No user found");
      if (user.uniqueId !== uniqueId) {
        client.emit("connect_failed", "User exists already.");
        client.disconnect(0);
        return;
      }
    }

    const gameState = await this.getGameState(userName);

    client.emit("gameState", gameState);

    await this.sendGameStateToAll();
  }
}
