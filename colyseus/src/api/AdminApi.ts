import { Router } from "express";
import { Request, Response, NextFunction } from "express";
import BaseService from "./BaseService";
import createRouter from "./BaseRouter";
import { CardModel, QuestionModel } from "../mongodb/schemas";
import { matchMaker } from "colyseus";
import { GameRoom } from "../rooms/GameRoom";

const router = Router();

type CardDTO = { text: string };
type QuestionDTO = { text: string; num: number };
class CardsService extends BaseService<CardDTO, CardDTO, CardDTO> {}
class QuestionsService extends BaseService<
  QuestionDTO,
  QuestionDTO,
  QuestionDTO
> {}
const cardsRouter = createRouter(new CardsService(CardModel));
const questionsRouter = createRouter(new QuestionsService(QuestionModel));

function checkAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.session.isAdmin) {
    next();
  } else {
    res.sendStatus(401);
  }
}

router.get("/admin", checkAdmin, (req, res) => {
  return res.json({ message: "Hello, Admin!" });
});

router.use("/cards", cardsRouter);
router.use("/questions", questionsRouter);

router.post("/game/start", checkAdmin, async (req, res) => {
  const { presentersMode } = req.body;
  try {
    const room = matchMaker.getRoomById("game_room") as GameRoom;
    await room.start(presentersMode ?? false);
  } catch (e: any) {
    console.error(e);
    res.status(400).json({ error: e.message });
    return;
  }
  res.sendStatus(200);
});

router.post("/game/stop", checkAdmin, async (req, res) => {
  try {
    const room = matchMaker.getRoomById("game_room") as GameRoom;
    await room.stop();
  } catch (e: any) {
    console.error(e);
    res.status(400).json({ error: e.message });
    return;
  }
  res.sendStatus(200);
});

export default router;
