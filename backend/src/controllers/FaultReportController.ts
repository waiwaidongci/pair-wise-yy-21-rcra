import type { NextFunction, Request, Response } from "express";
import { faultReportService } from "../services/FaultReportService";
import { createFaultReportPayload } from "../constructors/FaultReportDtoFactory";

// 控制器层二次包装：保留 service 抛出的 code/status，统一交给 errorHandlerMiddleware。
const wrap = (err: unknown, next: NextFunction) => {
  if (err instanceof Error && "code" in err) return next(err);
  return next(Object.assign(new Error("fault report controller failure"), { status: 500, code: "INTERNAL_ERROR", cause: err }));
};

export const faultReportController = {
  list: (_req: Request, res: Response) => res.json(faultReportService.list()),
  board: (_req: Request, res: Response) => res.json(faultReportService.mergeBoard()),
  create: (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(201).json(faultReportService.register(createFaultReportPayload(req.body)));
    } catch (err) {
      wrap(err, next);
    }
  },
  void: (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(faultReportService.void(Number(req.params.id)));
    } catch (err) {
      wrap(err, next);
    }
  }
};
