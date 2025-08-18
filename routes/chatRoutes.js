import express from "express";
import multer from "multer";
import { handleChat } from "../controllers/chatController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/chat", upload.single("audio"), handleChat);

export default router;
