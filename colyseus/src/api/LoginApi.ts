import { Router } from "express";
const router = Router();

router.post("/login", (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PW) {
    req.session.isAdmin = true;
    res.sendStatus(200);
  } else {
    res.sendStatus(401);
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
    } else {
      res.sendStatus(200);
    }
  });
});

router.get("/is_admin", (req, res) => {
  req.session.isAdmin ? res.sendStatus(200) : res.sendStatus(401);
});

export default router;
