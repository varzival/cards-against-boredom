import { Room, Client } from "@colyseus/core";
import { ArraySchema, Reflection } from "@colyseus/schema";
import {
  Card,
  GameRoomState,
  GameState,
  Question,
  User,
  VoteOption,
  VoteResult,
} from "./schema/GameRoomState";
import {
  CardModel,
  GameRoomStateModel,
  QuestionModel,
} from "../mongodb/schemas";

export interface IUserOptions {
  name: string;
  uniqueId: string;
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
  get autoDispose() {
    return false;
  }

  async onCreate() {
    // for sume reason, the room is not disposed of on shutdown without this
    process.on("SIGINT", async () => {
      console.log("SIGINT received");
    });

    try {
      await this.loadState();
    } catch (e) {
      console.error(e);
      console.log("Could not decode state, instantiating new game room state");
      this.setState(new GameRoomState());
    }
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
      const user = this.getUser(client);
      user.selectedCards.clear();
      for (const card of cards) {
        user.selectedCards.push(card);
      }
      user.selected = true;
      if (this.allCardsChosen()) {
        this.state.gameState = GameState.VOTE;
        this.shuffleVoteOptions();
        this.populateVoteOptions();
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
      const user = this.getUser(client);
      user.votedFor = data.voteOption;
      user.voted = true;
      if (this.allVoted()) {
        this.state.gameState = GameState.SHOW_RESULTS;
        this.calculatePoints();
        this.populateVoteResults();
      }
    });

    this.onMessage("continue", async (client) => {
      this.checkStarted();
      this.checkGameState(GameState.SHOW_RESULTS);
      const user = this.getUser(client);
      user.continue = true;
      if (this.allContinue()) {
        await this.resetGameRound();
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
    this.state.cards = [];
    this.state.questions = [];
    this.state.question = null;
    for (const user of this.state.users.values()) {
      user.cards.clear();
      user.selectedCards.clear();
      user.voteOrder = -1;
      user.votedFor = -1;
      user.voted = false;
      user.points = 0;
      user.continue = false;
      user.selected = false;
    }
  }

  getUser(client: Client): User {
    const user = this.state.users.get(client.userData.uniqueId);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  cleanupDisconnectedUser(uniqueId: string) {
    const user = this.state.users.get(uniqueId);
    if (user.sessionIds.length === 0) {
      this.state.users.delete(uniqueId);
    }
  }

  removeSession(client: Client) {
    const user = this.state.users.get(client.userData.uniqueId);
    user.sessionIds.splice(user.sessionIds.indexOf(client.sessionId), 1);
    if (user.sessionIds.length === 0) {
      user.active = false;
    }
  }

  addSession(client: Client) {
    const user = this.state.users.get(client.userData.uniqueId);
    user.sessionIds.push(client.sessionId);
    user.active = true;
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
        if (user.isAdmin && !user.voted) return false;
      }
      return true;
    }
    for (const user of this.state.users.values()) {
      if (!user.voted) return false;
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

  populateVoteOptions() {
    this.state.voteOptions.clear();
    const sortedUsers = Array.from(this.state.users.values()).sort(
      (a, b) => a.voteOrder - b.voteOrder
    );
    for (const user of sortedUsers) {
      const selectedCards = new Array<Card>();
      for (const idx of user.selectedCards) {
        selectedCards.push(user.cards[idx]);
      }
      const voteOption = new VoteOption();
      for (const card of selectedCards) {
        voteOption.cards.push(card);
      }
      this.state.voteOptions.push(voteOption);
    }
  }

  populateVoteResults() {
    this.state.voteResults.clear();
    const sortedUsers = Array.from(this.state.users.values()).sort(
      (a, b) => a.voteOrder - b.voteOrder
    );
    for (const user of sortedUsers) {
      const votedFor = sortedUsers
        .filter((u) => u.votedFor === user.voteOrder)
        .map((u) => u.name);
      const voteResult = new VoteResult({
        vote: user.voteOrder,
        owner: user.name,
      });
      for (const player of votedFor) {
        voteResult.players.push(player);
      }
      this.state.voteResults.push(voteResult);
    }
  }

  async resetGameRound() {
    this.state.gameState = GameState.SELECT_CARD;
    for (const user of this.state.users.values()) {
      user.cards = new ArraySchema(
        ...user.cards.filter((_, i) => !user.selectedCards.includes(i))
      );
      for (const _ of user.selectedCards) {
        await this.drawCard(user);
      }

      user.selectedCards.clear();
      user.continue = false;
      user.voteOrder = -1;
      user.votedFor = -1;
      user.voted = false;
      user.selected = false;
    }
    this.state.questions.shift();
    if (!this.state.questions.length) {
      await this.shuffleQuestions();
    }
    this.state.question = this.state.questions[0];
    this.state.voteOptions.clear();
    this.state.voteResults.clear();
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
    this.state.cards = [];
    for (const idx of idxCards) {
      const card = cards[idx];
      this.state.cards.push(new Card({ text: card.text }));
    }
  }

  async shuffleQuestions() {
    const questions = await QuestionModel.find({});
    let idxQuestions = Array.from(Array(questions.length).keys());
    idxQuestions = shuffle(idxQuestions);
    this.state.questions = [];
    for (const idx of idxQuestions) {
      const question = questions[idx];
      this.state.questions.push(
        new Question({ text: question.text, num: question.num })
      );
    }
    const topQuestion = this.state.questions[0];
    this.state.question = new Question({
      text: topQuestion.text,
      num: topQuestion.num,
    });
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
    let user = this.state.users.get(options.uniqueId);
    if (!user) {
      user = new User({
        name: options.name,
        sessionIds: [],
        uniqueId: options.uniqueId,
      });
      this.state.users.set(options.uniqueId, user);
    }
    if (
      user.sessionIds.includes(client.sessionId) ||
      user.name !== options.name
    ) {
      throw new Error("User already joined");
    }
    client.userData = { uniqueId: options.uniqueId };
    user.sessionIds.push(client.sessionId);

    if (this.state.startedAt) {
      this.dealCards(user);
    }
  }

  async onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left! consented:", consented);
    const user = this.getUser(client);
    if (consented) {
      user.sessionIds.splice(user.sessionIds.indexOf(client.sessionId), 1);
    } else {
      this.removeSession(client);
      try {
        await this.allowReconnection(client, 60);
        console.log(client.sessionId, "reconnected!");
        this.addSession(client);
      } catch (e) {
        // reconnection expired. remove player
        user.sessionIds.splice(user.sessionIds.indexOf(client.sessionId), 1);
      }
    }
    this.cleanupDisconnectedUser(client.userData.uniqueId);
  }

  async dumpState() {
    const encodedState = this.state.encodeAll();
    console.log(encodedState);
    const gameRoomState = new GameRoomStateModel({
      state: Buffer.from(encodedState),
    });
    //await gameRoomState.save();
  }

  async loadState() {
    const gameRoomState = await GameRoomStateModel.findOne().exec();
    const bufferContents = Array.from(gameRoomState.state);
    console.log(bufferContents);

    if (gameRoomState) {
      this.state = new GameRoomState();
      const decoded = this.state.decode(bufferContents);
      console.log(decoded);
      // this.setState(GameRoomState.decode(gameRoomState.state));
    } else {
      throw new Error("No game room state found");
    }
  }

  async onDispose() {
    console.log("room", this.roomId, "disposing...");
    await this.dumpState();
  }
}

// // Convert a Buffer to a number[]
// function bufferToNumberArray(buffer: Buffer): number[] {
//   const numberArray: number[] = [];
//   for (let i = 0; i < buffer.length; i += 4) {
//     const num = buffer.readUInt8(i);
//     console.log("num", num);
//     numberArray.push(num);
//   }
//   return numberArray;
// }
