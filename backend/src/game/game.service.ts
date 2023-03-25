import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Game } from "./entities/game.entity";
import { DataSource, IsNull, Not, Repository } from "typeorm";
import { Question } from "./entities/question.entity";
import { Card } from "./entities/card.entity";
import { User } from "./entities/user.entity";
import { DeckOfCards } from "./entities/deckOfCards.entity";
import { DeckOfQuestions } from "./entities/deckOfQuestions.entity";
import { HandOfCards } from "./entities/handOfCards.entity";

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game) private readonly gameRepository: Repository<Game>,
    @InjectRepository(Card) private readonly cardRepository: Repository<Card>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private dataSource: DataSource,
    @InjectRepository(DeckOfCards)
    private readonly deckOfCardsRepository: Repository<DeckOfCards>,
    @InjectRepository(HandOfCards)
    private readonly handOfCardsRepository: Repository<HandOfCards>,
    @InjectRepository(DeckOfQuestions)
    private readonly deckOfQuestionsRepository: Repository<DeckOfQuestions>
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
      game = new Game();
    }
    return game;
  }

  async findOneOrCreate(): Promise<Game> {
    return this.create();
  }

  async start(game: Game) {
    await this.shuffleDeck(game);

    const questions = await this.questionRepository.find({
      where: { id: Not(IsNull()) }
    });
    let idxQuestions = Array.from(Array(questions.length).keys());
    idxQuestions = this.shuffle(idxQuestions);
    game.deckOfQuestions = [];
    for (const idx of idxQuestions) {
      const doq = new DeckOfQuestions();
      doq.question = questions[idx];
      doq.order = idx;
      game.deckOfQuestions.push(doq);
    }

    const users = game.users;
    for (const user of users) {
      user.handOfCards = [];
      await this.drawCard(user, game);
    }

    game.startedAt = new Date();

    await this.userRepository.save(game.users);
    await this.gameRepository.save(game);

    //console.log(game);

    return game;
  }

  async stop(game: Game) {
    game.deckOfCards = [];
    await this.deckOfCardsRepository.delete({ gameId: game.id });
    game.deckOfQuestions = [];
    await this.deckOfQuestionsRepository.delete({ gameId: game.id });
    for (const user of game.users) {
      user.points = 0;
      user.handOfCards = [];
      await this.handOfCardsRepository.delete({ userId: user.id });
    }

    game.startedAt = null;
    await this.gameRepository.save(game);

    //console.log(game);

    return game;
  }

  async shuffleDeck(game: Game) {
    const cards = await this.cardRepository.find({
      where: { id: Not(IsNull()) }
    });
    let idxCards = Array.from(Array(cards.length).keys());
    idxCards = this.shuffle(idxCards);
    game.deckOfCards = [];
    for (const idx of idxCards) {
      const doc = new DeckOfCards();
      doc.card = cards[idx];
      doc.order = idx;
      game.deckOfCards.push(doc);
    }
  }

  async getFirstCard(game: Game) {
    if (!game.deckOfCards?.length) return null;
    const minOrder = Math.min(...game.deckOfCards.map((d) => d.order));
    return game.deckOfCards.find((doc) => doc.order === minOrder);
  }

  async drawCard(user: User, game: Game) {
    if (!game.deckOfCards?.length) await this.shuffleDeck(game);
    const firstCard = await this.getFirstCard(game);
    if (firstCard) {
      const hoc = new HandOfCards();
      hoc.card = firstCard.card;
      hoc.order = user.handOfCards.length;
      user.handOfCards.push(hoc);
      game.deckOfCards.shift();
    }
  }

  async delete() {
    const game = await this.findOne();
    this.gameRepository.delete(game);
  }

  async findOne(): Promise<Game> {
    return await this.gameRepository.findOne({
      where: { id: Not(IsNull()) },
      relations: {
        deckOfCards: {
          card: true
        },
        deckOfQuestions: {
          question: true
        },
        users: {
          handOfCards: {
            card: true
          }
        }
      }
    });
  }

  async createUser(name: string): Promise<User> {
    const user = await this.userRepository.create({ name });
    await this.userRepository.save(user);
    return user;
  }

  async findUser(name: string): Promise<User> {
    let user = await this.userRepository.findOneBy({ name });
    if (!user) user = await this.createUser(name);
    return user;
  }

  async assignUserToGame(user: User, game: Game) {
    user.game = game;
    await this.userRepository.save(user);
  }
}
