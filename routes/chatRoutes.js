import express from 'express';
import multer from 'multer';
import { handleChat, handleInitiateChat } from '../controllers/chatController.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Route for ongoing chat (with audio file)
router.post('/chat', upload.single('audio'), handleChat);

// Route for starting a conversation (no audio file)
router.post('/initiate', handleInitiateChat);

export default router;