import config from "@colyseus/tools";
import { monitor } from "@colyseus/monitor";
import { playground } from "@colyseus/playground";
import apiRouter from "./api/AdminApi";
import loginRouter from "./api/LoginApi";
import express from "express";
import session from "express-session";

declare module "express-session" {
  interface SessionData {
    isAdmin?: boolean;
  }
}

/**
 * Import your Room files
 */
import { GameRoom } from "./rooms/GameRoom";
import { connect } from "mongoose";

export default config({
  //   options: {
  //     devMode: process.env.NODE_ENV !== "production",
  //   },
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
    app.use(
      session({
        secret:
          process.env.SECRET || "verysecretkeydonttellanyonethankyouverymuch",
      })
    );
    app.use(express.json());
    app.use("/api/auth", loginRouter);
    app.use("/api", apiRouter);

    app.use("/", express.static("./dist"));
    app.get("/admin", (req, res) => {
      res.sendFile("index.html", { root: "./dist" });
    });

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
