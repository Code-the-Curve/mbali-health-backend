import express from 'express';
const PORT = process.env.HTTP_PORT || 8081;
const app = express();


app.get('/', (req, res) => {
  res.send('just gonna send it');
});

app.listen(PORT, () => {
  console.log(`Server listening at port ${PORT}.`);
});
