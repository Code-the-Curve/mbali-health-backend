import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';


import http from 'http';
import socket from 'socket.io';

import whatsAppRouter from './routes/Whatsapp.js';
import messages from './routes/Consultation.js';
import wscontroller from './controllers/WebsocketController.js';
import registration from './routes/Registration.js';
import deregistration from './routes/Deregistration';

//todo test only
import TestDataCreator from "./controllers/TestDataCreator";

const url = `mongodb://${process.env.MONGO_URI || 'mongo:27017'}/codethecurve`
const PORT = process.env.HTTP_PORT || 8081;
const app = express();

mongoose.connect(url, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
})
.then(() => console.log('DB connnection successful!'));


app.use(cors());

app.use(
  express.urlencoded({
    extended: false
  })
);

app.use(express.json());

// TestDataCreator.createTestData()


// Routes
app.use("/messaging/whatsapp", whatsAppRouter);
//todo test only
// TestDataCreator.createTestData()
app.use('/register',registration);
app.use('/deregister',deregistration);
app.use('/consultation', messages);

const server = http.createServer(app).listen(PORT, () => {
  console.log(`Server listening at port ${PORT}.`);
});

const io = socket(server);


io.on('connection', client => {
  client.on('join', room => {
    wscontroller.handleJoin(client, room)
  })

  client.on('message', data => {
    wscontroller.handleMessageReceived(client, data)
  })

})
