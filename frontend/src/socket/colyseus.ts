import { Client, Room } from "colyseus.js";

class ColyseusClient {
  public readonly client: Client;
  private _room: Room | null = null; // TODO typing
  public get room() {
    return this._room;
  }
  public get connected() {
    return this._room?.connection ?? false;
  }

  constructor() {
    // TODO make configurable
    this.client = new Client("ws://localhost:5000");
  }

  public async connect(name: string) {
    try {
      this._room = await this.client.joinOrCreate("game_room", { name });
    } catch (e) {
      console.error("join error", e);
    }

    // TODO retry
  }

  public async leave() {
    if (this._room) {
      await this._room.leave();
      this._room = null;
    }
  }
}

export default new ColyseusClient();
