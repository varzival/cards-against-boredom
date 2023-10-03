import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Game, GameDocument, GameState } from "../game/schemas/game.schema";
import { Model } from "mongoose";

@Injectable()
export class UsersService {
  constructor(@InjectModel(Game.name) private gameModel: Model<Game>) {}

  async findOrCreateGame() {
    let game = await this.gameModel.findOne();
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

  async setUserAdmin(userName: string, uniqueId: string) {
    const game = await this.findOrCreateGame(); // TODO: deal with mutiple games
    const userIdx = game.users.findIndex((u) => u.name === userName);
    if (userIdx >= 0) {
      game.users[userIdx].isAdmin = true;
      await game.save();
    } else {
      await this.assignUserToGame(userName, uniqueId, game, true);
    }
  }

  async assignUserToGame(
    userName: string,
    uniqueId: string,
    game: GameDocument,
    isAdmin = false
  ) {
    if (!game.users?.find((u) => u.name === userName)) {
      return this.gameModel
        .updateOne(
          { _id: game.id },
          {
            $push: {
              users: {
                uniqueId: uniqueId,
                name: userName,
                points: 0,
                cards: [],
                selectedCards: [],
                voteOrder: null,
                votedFor: null,
                continue: false,
                isAdmin
              }
            }
          }
        )
        .exec();
    }
    return false;
  }

  async deleteUserFromGame(userName: string, game: GameDocument) {
    return this.gameModel
      .updateOne(
        { _id: game.id },
        {
          $pull: {
            users: {
              name: userName
            }
          }
        }
      )
      .exec();
  }
}
