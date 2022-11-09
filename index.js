const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mongo DB Setup

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
    const servicesDataCollection = client
      .db('aboutYouPhotography')
      .collection('servicesData');
    const recentWorkDataCollection = client
      .db('aboutYouPhotography')
      .collection('recentWork');
    app.get('/slider', async (req, res) => {
      const query = {};
      const cursor = sliderDataCollection.find(query);
      const slidesData = await cursor.toArray();
      res.send(slidesData);
    });
    app.get('/services', async (req, res) => {
      const serviceLimit = +req.query.limit;
      const query = {};
      const cursor = servicesDataCollection.find(query);
      if (serviceLimit === 3) {
        const slidesData = await cursor.limit(serviceLimit).toArray();
        res.send(slidesData);
      } else {
        const slidesData = await cursor.toArray();
        res.send(slidesData);
      }
    });
    app.get('/services/:serviceId', async (req, res) => {
      const serviceId = req.params.serviceId;
      console.log(serviceId);
      const query = { _id: ObjectId(serviceId) };
      const serviceDetails = await servicesDataCollection.findOne(query);
      res.send(serviceDetails);
    });
    app.get('/recent_work', async (req, res) => {
      const query = {};
      const cursor = recentWorkDataCollection.find(query);
      const recentWorkData = await cursor.toArray();
      res.send(recentWorkData);
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
