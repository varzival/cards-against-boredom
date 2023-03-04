import { Injectable } from "@nestjs/common";
import { UpdateGameDto } from "./dto/update-game.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Game } from "./entities/game.entity";
import { IsNull, Not, Repository } from "typeorm";
import { Question } from "./entities/question.entity";
import { Card } from "./entities/card.entity";
import { User } from "./entities/user.entity";

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

  create() {
    const game = this.gameRepository.create();
    const cards = this.cardRepository.find();
    console.log(game);
    console.log(cards);
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
