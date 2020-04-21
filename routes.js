import exress from 'express';
import WhatsappBot from './WhatsappBot.js';

const routes = exress.Router();

routes.post('/incoming_whatsapp', WhatsappBot.welcomePatient);

export default routes;
