import { Request, Response } from "express";

export async function returnPing(req: Request, res: Response) {
  res.status(200).json({ data: "pong" });
}
