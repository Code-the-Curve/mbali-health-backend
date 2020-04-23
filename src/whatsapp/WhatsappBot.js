import dotenv from 'dotenv';
import twilio from 'twilio';


dotenv.config();

twilio(process.env.SID, process.env.TOKEN);
const {MessagingResponse} = twilio.twiml;

class WhatsappBot {

  static welcomePatient(req, res, next) {
    const twiml = new MessagingResponse();
    const q = req.body.Body;

    try {

      twiml.message(`Welcome to our service, please send us your location so we can better assist you`);

      res.set('Content-Type', 'text/xml');

      return res.status(200).send(twiml.toString());
    } catch (error) {
      return next(error);
    }
  }

}

export default WhatsappBot;
