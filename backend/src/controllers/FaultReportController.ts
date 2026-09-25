import type { NextFunction, Request, Response } from "express";
import { faultReportService } from "../services/FaultReportService";
import { ERROR_MESSAGES } from "../constants/errorMessages";

// 控制器层再包装一次异常：service 抛出的业务错误透传，未知错误统一兜底。
const wrap = (err: unknown) => {
  if (err instanceof Error && "code" in err) return err;
  return Object.assign(new Error(ERROR_MESSAGES.VALIDATION_FAILED), { status: 500 });
};

export const faultReportController = {
  list: (_req: Request, res: Response) => res.json(faultReportService.list()),
  create: (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(201).json(faultReportService.register(req.body));
    } catch (err) {
      next(wrap(err));
    }
  },
  void: (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(faultReportService.voidMaster(Number(req.params.id)));
    } catch (err) {
      next(wrap(err));
    }
  }
};
