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
    // proxy doesn't really work, so hard coding for local development
    this.client = new Client(
      import.meta.env.VITE_COLYSEUS_URL ?? "ws://localhost:5000"
    );
  }

  private async tryReconnect(name: string, reconnectionToken: string) {
    try {
      this._room = await this.client.reconnect(reconnectionToken);
    } catch (e) {
      console.error("reconnect error", e);
      this._room = await this.client.joinOrCreate("game_room", { name });
    }
  }

  public async connect(name: string, reconnectionToken?: string) {
    if (reconnectionToken) {
      await this.tryReconnect(name, reconnectionToken);
    } else {
      this._room = await this.client.joinOrCreate("game_room", { name });
    }
    return this._room?.reconnectionToken;
    // TODO retry
  }

  public async leave() {
    if (this._room) {
      await this._room.leave();
      this._room = null;
    }
  }

  public async resetRoom() {
    this._room = null;
  }
}

export default new ColyseusClient();
