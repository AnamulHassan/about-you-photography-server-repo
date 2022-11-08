const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mongo DB Setup

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.PASSWORD_DB}@cluster0.yts1hwu.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const sliderDataCollection = client
      .db('aboutYouPhotography')
      .collection('sliderData');
    app.get('/slider', async (req, res) => {
      const query = {};
      const cursor = sliderDataCollection.find(query);
      const slidesData = await cursor.toArray();
      res.send(slidesData);
    });
  } finally {
  }
}
run().catch(error => console.log(error));

// Initial Setup
app.get('/', (req, res) => {
  res.send('About You Photography server in running');
});
app.listen(port, () => {
  console.log('About You Photography server is running on port', port);
});
