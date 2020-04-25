import dotenv from 'dotenv';
import twilio from 'twilio';
import Api from './Api'

dotenv.config();

const twilioClient = twilio(process.env.SID, process.env.TOKEN);
const {MessagingResponse} = twilio.twiml;

class WhatsappBot {

  static incomingMessage(req, res, next) {
    const twiml = new MessagingResponse();
    const content = req.body.Body;
    const from = req.body.From
    console.log(req.body)

    try {

      twiml.message(`Welcome to our service, please send us your location so we can better assist you`);

      res.set('Content-Type', 'text/xml');

      return res.status(200).send(twiml.toString());
    } catch (error) {
      return next(error);
    }
  }

  static sendMessage(req, res) {
    console.log(req.params)
    var to = req.params.to;
    var body = req.body.Body
    WhatsappBot.sendOutgoingMessage(to, body)
      .then(message => {
        console.log(message.sid)
        return Api.okWithContent(res,{ message });
      })
      .catch(error => {
        return Api.errorWithMessage(res,{ error });
      });
    
  }

  static sendOutgoingMessage(to, body) {
    console.log(body)
    return twilioClient.messages.create({
        from: 'whatsapp:+254203893148',
        body: body,
        to: to,
      })
  }
}

export default WhatsappBot;