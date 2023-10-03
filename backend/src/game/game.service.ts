import { Injectable, Logger } from "@nestjs/common";
import { Model } from "mongoose";
import { GameDocument, GameState, Game, User } from "./schemas/game.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Card } from "../cards/schemas/card.schema";
import { Question } from "../questions/schemas/question.schema";

@Injectable()
export class GameService {
  private readonly logger = new Logger(GameService.name);

  constructor(
    @InjectModel(Game.name) private gameModel: Model<Game>,
    @InjectModel(Card.name) private cardModel: Model<Card>,
    @InjectModel(Question.name) private questionModel: Model<Question>
  ) {}

  private shuffle(array: Array<any>) {
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

  async create() {
    let game = await this.findOne();
    if (!game) {
      game = new this.gameModel({
        startedAt: null,
        state: GameState.SELECT_CARD,
        users: []
      });
      await game.save();
    }
    return game;
  }

  async setGameState(game: GameDocument, state: GameState) {
    game.state = state;
    return game.save();
  }

  async findOneOrCreate(): Promise<GameDocument> {
    return this.create();
  }

  async start(game: GameDocument) {
    if (game.startedAt) {
      this.logger.error(`game ${game.id} is already started`);
      throw new Error(`game ${game.id} is already started`);
    }
    await this.shuffleDeck(game);
    await this.shuffleQuestions(game);

    for (const user of game.users) {
      await this.dealCards(game, user);
    }

    game.startedAt = new Date();

    await game.save();

    return game;
  }

  async stop(game: GameDocument) {
    game.cards = [];
    game.questions = [];
    for (const user of game.users) {
      user.points = 0;
      user.cards = [];
      user.selectedCards = [];
      user.voteOrder = null;
      user.votedFor = null;
      user.continue = false;
    }

    game.startedAt = null;
    game.state = GameState.SELECT_CARD;

    await game.save();

    return game;
  }

  async dealCards(game: GameDocument, user: User) {
    user.cards = [];
    for (let i = 0; i < 10; i++) {
      await this.drawCard(game, user);
    }
  }

  async resetGameRound(game: GameDocument) {
    for (const user of game.users) {
      user.cards = user.cards.filter((_, i) => !user.selectedCards.includes(i));
      for (const _ of user.selectedCards) {
        await this.drawCard(game, user);
      }

      user.selectedCards = [];
      user.continue = false;
      user.voteOrder = null;
      user.votedFor = null;

      game.questions.shift();
      if (!game.questions.length) {
        await this.shuffleQuestions(game);
      }
    }
  }

  async calculatePoints(game: GameDocument) {
    for (const user of game.users) {
      user.points += game.users.filter(
        (u) => u.votedFor === user.voteOrder && u.name !== user.name
      ).length;
    }
  }

  async shuffleDeck(game: GameDocument) {
    const cards = await this.cardModel.find({});
    let idxCards = Array.from(Array(cards.length).keys());
    idxCards = this.shuffle(idxCards);
    game.cards = [];
    for (const idx of idxCards) {
      game.cards.push(cards[idx]);
    }
  }

  async shuffleQuestions(game: GameDocument) {
    const questions = await this.questionModel.find({});
    let idxQuestions = Array.from(Array(questions.length).keys());
    idxQuestions = this.shuffle(idxQuestions);
    game.questions = [];
    for (const idx of idxQuestions) {
      game.questions.push(questions[idx]);
    }
  }

  shuffleVoteOptions(game: GameDocument) {
    let idxUsers = Array.from(Array(game.users.length).keys());
    idxUsers = this.shuffle(idxUsers);
    let i = 0;
    for (const idx of idxUsers) {
      game.users[idx].voteOrder = i;
      i++;
    }
  }

  async drawCard(game: GameDocument, user: User) {
    if (!game.cards?.length) await this.shuffleDeck(game);
    if (!game.cards?.length) return null;

    const firstCard = game.cards.shift();

    if (firstCard) {
      user.cards.push(firstCard);
    }
  }

  deselectCards(user: User) {
    user.selectedCards = [];
  }

  async selectCard(user: User, cardIndices: Array<number>) {
    this.deselectCards(user);
    user.selectedCards = cardIndices;
  }

  async vote(user: User, voteOption: number) {
    user.votedFor = voteOption;
  }

  allCardsChosen(game: Game) {
    for (const user of game.users) {
      if (user.selectedCards.length < game.questions[0].num) return false;
    }
    return true;
  }

  allVoted(game: GameDocument) {
    for (const user of game.users) {
      if (user.votedFor === null) return false;
    }
    return true;
  }

  allContinue(game: GameDocument) {
    for (const user of game.users) {
      if (!user.continue) return false;
    }
    return true;
  }

  async findOne(): Promise<GameDocument> {
    return this.gameModel
      .findOne()
      .populate(["cards", "questions", "users.cards"])
      .exec();
  }

  async findOneLean(): Promise<Game> {
    return this.gameModel
      .findOne()
      .populate(["cards", "questions", "users.cards"])
      .lean()
      .exec();
  }
}
