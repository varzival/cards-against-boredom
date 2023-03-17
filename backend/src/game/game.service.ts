import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Game } from "./entities/game.entity";
import { IsNull, Not, Repository } from "typeorm";
import { Question } from "./entities/question.entity";
import { Card } from "./entities/card.entity";
import { User } from "./entities/user.entity";
import { DeckOfCards } from "./entities/deckOfCards.entity";
import { DeckOfQuestions } from "./entities/deckOfQuestions.entity";

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game) private readonly gameRepository: Repository<Game>,
    @InjectRepository(Card) private readonly cardRepository: Repository<Card>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
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

      console.log(game);

      game.startedAt = new Date();
      this.gameRepository.save(game);
    }

    return game;
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
        users: true
      }
    });
  }

  async findUser(name: string): Promise<User> {
    let user = await this.userRepository.findOneBy({ name });
    if (!user) {
      user = await this.userRepository.create({ name });
      await this.userRepository.save(user);
    }
    return user;
  }

  async assignUserToGame(user: User, game: Game) {
    user.game = game;
    await this.userRepository.save(user);
  }
}
