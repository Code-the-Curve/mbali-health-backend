import express from 'express';
import WhatsappBot from '../controllers/WhatsappBot.js';

const router = express.Router();

router.post('/incoming', WhatsappBot.incomingMessage);

export default router;
