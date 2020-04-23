import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import whatsapp from './routes/Whatsapp.js';

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

app.use(whatsapp);

app.get('/', (req, res) => {
  res.send('just gonna send it');
});


app.listen(PORT, () => {
  console.log(`Server listening at port ${PORT}.`);
});
