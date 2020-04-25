import express from 'express';
import WhatsappBot from '../controllers/WhatsappBot.js';

const router = express.Router();

router.post('/incoming', WhatsappBot.incomingMessage);
router.post('/send/:to', WhatsappBot.sendMessage);

export default router;
