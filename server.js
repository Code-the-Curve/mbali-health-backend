import express from 'express';
import cors from 'cors';
import routes from './routes.js';


const PORT = process.env.HTTP_PORT || 8081;
const app = express();

app.use(cors());

app.use(
  express.urlencoded({
    extended: false
  })
);

app.use(express.json());

app.use(routes);

app.get('/', (req, res) => {
  res.send('just gonna send it');
});


app.listen(PORT, () => {
  console.log(`Server listening at port ${PORT}.`);
});
