import config from "@colyseus/tools";
import { monitor } from "@colyseus/monitor";
import { playground } from "@colyseus/playground";
import express from "express";

/**
 * Import your Room files
 */
import { GameRoom } from "./rooms/GameRoom";
import { connect } from "mongoose";

export default config({
  initializeGameServer: async (gameServer) => {
    /**
     * Define your room handlers:
     */
    gameServer.define("game_room", GameRoom);
    await connect(process.env.MONGO_DB_CONNECTION_STRING);
  },

  initializeExpress: (app) => {
    /**
     * Bind your custom express routes here:
     * Read more: https://expressjs.com/en/starter/basic-routing.html
     */
    app.get("/api", (req, res) => {
      res.send("API");
    });

    app.use(["/", "/admin"], express.static("./dist"));

    /**
     * Use @colyseus/playground
     * (It is not recommended to expose this route in a production environment)
     */
    if (process.env.NODE_ENV !== "production") {
      app.use("/playground", playground);
    }

    /**
     * Use @colyseus/monitor
     * It is recommended to protect this route with a password
     * Read more: https://docs.colyseus.io/tools/monitor/#restrict-access-to-the-panel-using-a-password
     */
    app.use("/monitor", monitor());
  },

  beforeListen: () => {
    /**
     * Before before gameServer.listen() is called.
     */
  },
});
