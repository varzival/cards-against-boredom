import { Room, Client } from "@colyseus/core";
import {
  Card,
  GameRoomState,
  GameState,
  Question,
  User,
} from "./schema/GameRoomState";
import { CardModel, QuestionModel } from "../mongodb/schemas";

export interface IUserOptions {
  name: string;
}

function shuffle(array: Array<any>) {
  for (let i = array.length - 1; i > 0; i--) {
    // Fisher-Yates shuffle

    // Pick a random index from 0 to i inclusive
    let j = Math.floor(Math.random() * (i + 1));

    // Swap arr[i] with the element
    // at random index
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export class GameRoom extends Room<GameRoomState> {
  maxClients = 100;

  async onCreate() {
    // TODO load from database
    this.setState(new GameRoomState());
    this.roomId = "game_room";

    this.onMessage("selectCards", (client, data) => {
      this.checkStarted();
      this.checkGameState(GameState.SELECT_CARD);
      this.validateArrayOfNumbers(data.cards);
      const cards = [...new Set(data.cards)] as number[];
      if (cards.length !== data.cards.length) {
        throw new Error("Duplicate cards not allowed");
      }
      if (this.state.questions[0].num !== cards.length) {
        throw new Error("Not the right amount of cards chosen");
      }
      const user = this.getUser(client.sessionId);
      user.selectedCards.clear();
      for (const card of cards) {
        user.selectedCards.push(card);
      }
      if (this.allCardsChosen()) {
        this.state.gameState = GameState.VOTE;
        this.shuffleVoteOptions();
      }
    });

    this.onMessage("vote", (client, data) => {
      this.checkStarted();
      this.checkGameState(GameState.VOTE);
      if (!(typeof data.voteOption === "number")) {
        throw new Error("Invalid data type for vote");
      }
      if (data.voteOption < 0 || data.voteOption >= this.state.users.size) {
        throw new Error("Invalid vote");
      }
      const user = this.getUser(client.sessionId);
      user.votedFor = data.voteOption;
      if (this.allVoted()) {
        this.state.gameState = GameState.SHOW_RESULTS;
        this.calculatePoints();
      }
    });

    this.onMessage("continue", (client) => {
      this.checkStarted();
      this.checkGameState(GameState.SHOW_RESULTS);
      const user = this.getUser(client.sessionId);
      user.continue = true;
      if (this.allContinue()) {
        this.state.gameState = GameState.SELECT_CARD;
      }
    });
  }

  public async start(presentersMode: boolean) {
    if (this.state.startedAt) {
      throw new Error("Game has already been started");
    }
    await this.shuffleDeck();
    await this.shuffleQuestions();
    for (const user of this.state.users.values()) {
      await this.dealCards(user);
    }
    if (presentersMode) {
      this.state.presentersMode = true;
    }

    this.state.startedAt = new Date().toISOString();
  }

  public async stop() {
    if (!this.state.startedAt) {
      throw new Error("Game hasn't been started yet");
    }
    this.state.startedAt = null;
    this.state.presentersMode = false;
    this.state.gameState = GameState.SELECT_CARD;
    this.state.cards.clear();
    this.state.questions.clear();
    for (const user of this.state.users.values()) {
      user.cards.clear();
      user.selectedCards.clear();
      user.voteOrder = -1;
      user.votedFor = -1;
      user.points = 0;
      user.continue = false;
    }
  }

  getUser(sessionId: string) {
    const user = this.state.users.get(sessionId);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  validateArrayOfNumbers(data: any) {
    if (
      !Array.isArray(data) ||
      !data.every((num: any) => typeof num === "number")
    ) {
      throw new Error("Invalid data type for cards");
    }
  }

  checkStarted() {
    if (!this.state.startedAt) {
      throw new Error("Game hasn't been started yet");
    }
  }

  checkGameState(gameState: GameState) {
    if (!(this.state.gameState === gameState)) {
      throw new Error(`Game is not in ${gameState} state`);
    }
  }

  allCardsChosen() {
    if (this.state.presentersMode) {
      for (const user of this.state.users.values()) {
        if (
          !user.isAdmin &&
          user.selectedCards.length < this.state.questions[0].num
        )
          return false;
      }
      return true;
    }
    for (const user of this.state.users.values()) {
      if (user.selectedCards.length < this.state.questions[0].num) return false;
    }
    return true;
  }

  allVoted() {
    if (this.state.presentersMode) {
      for (const user of this.state.users.values()) {
        if (user.isAdmin && user.votedFor === null) return false;
      }
      return true;
    }
    for (const user of this.state.users.values()) {
      if (user.votedFor === null) return false;
    }
    return true;
  }

  allContinue() {
    if (this.state.presentersMode) {
      for (const user of this.state.users.values()) {
        if (user.isAdmin && !user.continue) return false;
      }
      return true;
    }
    for (const user of this.state.users.values()) {
      if (!user.continue) return false;
    }
    return true;
  }

  calculatePoints() {
    const users = Array.from(this.state.users.values());
    for (const user of users) {
      user.points += users.filter(
        (u) => u.votedFor === user.voteOrder && u.name !== user.name
      ).length;
    }
  }

  shuffleVoteOptions() {
    const numUsers = this.state.users.size;
    let idxUsers = Array.from({ length: numUsers }, (_, i) => i);
    idxUsers = shuffle(idxUsers);
    let i = 0;
    const keys = Array.from(this.state.users.keys());
    for (const idx of idxUsers) {
      this.state.users.get(keys[idx]).voteOrder = i;
      i++;
    }
  }

  async resetGameRound() {
    const cards = Array.from(this.state.cards);
    for (const user of this.state.users.values()) {
      user.cards.clear();
      // TODO does that work? Is there an easier way?
      for (const card of cards.filter(
        (_, i) => !user.selectedCards.includes(i)
      )) {
        user.cards.push(card);
      }
      for (const _ of user.selectedCards) {
        await this.drawCard(user);
      }

      user.selectedCards.clear();
      user.continue = false;
      user.voteOrder = null;
      user.votedFor = null;
    }
    this.state.questions.shift();
    if (!this.state.questions.length) {
      await this.shuffleQuestions();
    }
  }

  async dealCards(user: User) {
    user.cards.clear();
    for (let i = 0; i < 10; i++) {
      await this.drawCard(user);
    }
  }

  async shuffleDeck() {
    const cards = await CardModel.find({});
    let idxCards = Array.from(Array(cards.length).keys());
    idxCards = shuffle(idxCards);
    this.state.cards.clear();
    for (const idx of idxCards) {
      const card = cards[idx];
      this.state.cards.push(new Card({ text: card.text }));
    }
  }

  async shuffleQuestions() {
    const questions = await QuestionModel.find({});
    let idxQuestions = Array.from(Array(questions.length).keys());
    idxQuestions = shuffle(idxQuestions);
    this.state.questions.clear();
    for (const idx of idxQuestions) {
      const question = questions[idx];
      this.state.questions.push(
        new Question({ text: question.text, num: question.num })
      );
    }
  }

  async drawCard(user: User) {
    if (!this.state.cards.length) {
      await this.shuffleDeck();
    }
    const firstCard = this.state.cards.shift();
    if (firstCard) {
      user.cards.push(firstCard);
    }
  }

  onJoin(client: Client, options: IUserOptions) {
    if (!options.name) {
      throw new Error("name is required");
    }
    console.log(client.sessionId, options.name, "joined!");
    this.state.users.set(client.sessionId, new User({ name: options.name }));
  }

  async onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left! consented:", consented);
    if (consented) {
      this.state.users.delete(client.sessionId);
    } else {
      this.state.users.get(client.sessionId).active = false;
      try {
        await this.allowReconnection(client, 60);
        console.log(client.sessionId, "reconnected!");
        this.state.users.get(client.sessionId).active = true;
      } catch (e) {
        // reconnection expired. remove player
        this.state.users.delete(client.sessionId);
      }
    }
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }
}
