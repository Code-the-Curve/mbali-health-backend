import express from 'express';
import WhatsappBot from '../Whatsapp/WhatsappBot.js';

const routes = express.Router();

routes.post('/incoming_whatsapp', WhatsappBot.welcomePatient);

export default routes;
