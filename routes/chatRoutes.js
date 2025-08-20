import express from 'express';
import multer from 'multer';
// Import BOTH controller functions
import { handleChat, handleInitiateChat } from '../controllers/chatController.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Route for ongoing chat (with audio)
router.post('/chat', upload.single('audio'), handleChat);

// NEW Route for starting a conversation (no audio)
router.post('/initiate-chat', handleInitiateChat);

export default router;