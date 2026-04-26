import { Router, type IRouter } from "express";
import healthRouter from "./health";
import chatRouter from "./chat";
import scholarshipsRouter from "./scholarships";
import inspireRouter from "./inspire";

const router: IRouter = Router();

router.use(healthRouter);
router.use(chatRouter);
router.use(scholarshipsRouter);
router.use(inspireRouter);

export default router;
