import express, { Request } from "express";
import BaseService from "./BaseService";

interface FindAllQuery {
  perPage?: string;
  page?: string;
}

function createRouter<CreateDTO, UpdateDTO, Type>(
  service: BaseService<CreateDTO, UpdateDTO, Type>
) {
  const router = express.Router();

  router.post("/", async (req, res) => {
    try {
      const result = await service.create(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error });
    }
  });

  router.get(
    "/",
    async (
      req: Request<never, Type[] | { error: any }, never, FindAllQuery>,
      res
    ) => {
      try {
        const result = await service.findAll(
          Number(req.query.perPage),
          Number(req.query.page)
        );
        res.status(200).json(result);
      } catch (error) {
        res.status(400).json({ error });
      }
    }
  );

  router.get("/:id", async (req, res) => {
    try {
      const result = await service.findOne(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error });
    }
  });

  router.patch("/:id", async (req, res) => {
    try {
      const result = await service.update(req.params.id, req.body);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error });
    }
  });

  router.delete("/:id", async (req, res) => {
    try {
      const result = await service.remove(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error });
    }
  });

  return router;
}

export default createRouter;
