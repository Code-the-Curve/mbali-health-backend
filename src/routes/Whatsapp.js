import express from 'express';
import WhatsappBot from '../controllers/WhatsappBot.js';

const router = express.Router();

router.post('/incoming', WhatsappBot.welcomePatient);

export default router;
