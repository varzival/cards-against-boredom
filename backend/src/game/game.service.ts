import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Game } from "./entities/game.entity";
import { DataSource, IsNull, Not, Raw, Repository } from "typeorm";
import { Question } from "./entities/question.entity";
import { Card } from "./entities/card.entity";
import { User } from "./entities/user.entity";
import { DeckOfCards } from "./entities/deckOfCards.entity";
import { DeckOfQuestions } from "./entities/deckOfQuestions.entity";
import { HandOfCards } from "./entities/handOfCards.entity";

@Injectable()
export class GameService {
  private readonly logger = new Logger(GameService.name);

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
    if (game.startedAt) {
      this.logger.error(`game ${game.id} is already started`);
      throw new Error(`game ${game.id} is already started`);
    }
    await this.shuffleDeck(game);
    await this.shuffleQuestions(game);

    const users = game.users;
    for (const user of users) {
      user.handOfCards = [];
      for (let i = 0; i < 10; i++) {
        await this.drawCard(user, game);
      }
    }

    game.startedAt = new Date();

    await this.userRepository.save(game.users);
    await this.gameRepository.save(game);

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

    return game;
  }

  async shuffleDeck(game: Game) {
    const cards = await this.cardRepository.find({
      where: { id: Not(IsNull()) }
    });
    let idxCards = Array.from(Array(cards.length).keys());
    idxCards = this.shuffle(idxCards);
    game.deckOfCards = [];
    let i = 0;
    for (const idx of idxCards) {
      const doc = new DeckOfCards();
      doc.card = cards[idx];
      doc.order = i;
      game.deckOfCards.push(doc);
      i++;
    }
  }

  async shuffleQuestions(game: Game) {
    const questions = await this.questionRepository.find({
      where: { id: Not(IsNull()) }
    });
    let idxQuestions = Array.from(Array(questions.length).keys());
    idxQuestions = this.shuffle(idxQuestions);
    game.deckOfQuestions = [];
    let i = 0;
    for (const idx of idxQuestions) {
      const doq = new DeckOfQuestions();
      doq.question = questions[idx];
      doq.order = i;
      game.deckOfQuestions.push(doq);
      i++;
    }
  }

  async drawCard(user: User, game: Game) {
    if (!game.deckOfCards?.length) await this.shuffleDeck(game);

    if (!game.deckOfCards?.length) return null;
    const minOrder = Math.min(...game.deckOfCards.map((d) => d.order));
    const idx = game.deckOfCards.findIndex((doc) => doc.order === minOrder);
    const firstCard = game.deckOfCards[idx];
    game.deckOfCards.splice(idx, 1);

    if (firstCard) {
      const hoc = new HandOfCards();
      hoc.card = firstCard.card;
      hoc.order = user.handOfCards.length;
      user.handOfCards.push(hoc);
    }
  }

  getQuestion(game: Game) {
    if (!game.deckOfQuestions?.length) return null;
    const minOrder = Math.min(...game.deckOfQuestions.map((d) => d.order));
    const idx = game.deckOfQuestions.findIndex((doc) => doc.order === minOrder);
    return game.deckOfQuestions[idx].question;
  }

  async deselectCards(user: User) {
    const selectedCards = await this.handOfCardsRepository.find({
      where: {
        userId: user.id,
        selected: true
      }
    });

    for (const card of selectedCards) {
      card.selected = false;
      await this.handOfCardsRepository.save(card);
    }
  }

  async selectCard(user: User, cardIndices: Array<number>) {
    await this.deselectCards(user);
    const selectedCards = await this.handOfCardsRepository.find({
      where: {
        userId: user.id,
        order: Raw((alias) => `${alias} IN (:...cardIndices)`, {
          cardIndices: cardIndices
        })
      }
    });
    for (const card of selectedCards) {
      card.selected = true;
      await this.handOfCardsRepository.save(card);
    }

    this.logger.log(`${user.name} selected ${cardIndices}`);
  }

  allCardsChosen(game: Game) {
    for (const user of game.users) {
      if (
        user.handOfCards?.filter((c) => c.selected)?.length <
        this.getQuestion(game).num
      )
        return false;
    }
    return true;
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
