import express from "express";
import { returnPing } from "../controller/messageController";

const router = express.Router();

// Check the health of the service
router.get("/ping", returnPing);

export default router;
