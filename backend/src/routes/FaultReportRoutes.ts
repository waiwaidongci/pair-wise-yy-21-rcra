import { Router } from "express";
import { faultReportController } from "../controllers/FaultReportController";
const router = Router();
router.get("/", faultReportController.list);
router.get("/merge-board", faultReportController.board);
router.post("/", faultReportController.create);
router.post("/:id/void", faultReportController.void);
export default router;
