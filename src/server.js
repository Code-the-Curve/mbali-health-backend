import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import http from 'http';
import socket from 'socket.io';

import whatsapp from './routes/Whatsapp.js';
import wscontroller from './controllers/WebsocketController.js';

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


// Routes
app.use(whatsapp);

const server = http.createServer(app).listen(PORT, () => {
  console.log(`Server listening at port ${PORT}.`);
});

const io = socket(server);


io.on('connection', client => {
  client.on('join', (room, cb) => {
    wscontroller.handleJoin(client, room, cb)
  })

  client.on('message', data => {
    wscontroller.handleMessageReceived(client, data)
  })

})
