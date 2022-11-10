const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');
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

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: 'unauthorized access' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (error, decoded) {
    if (error) {
      return res.status(403).send({ message: 'forbidden access' });
    }
    req.decoded = decoded;
    next();
  });
}

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
    const reviewDataCollection = client
      .db('aboutYouPhotography')
      .collection('reviewData');

    app.post('/jwt', (req, res) => {
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1h',
      });
      res.send({ token });
    });

    app.get('/slider', async (req, res) => {
      const query = {};
      const cursor = sliderDataCollection.find(query);
      const slidesData = await cursor.toArray();
      res.send(slidesData);
    });
    app.get('/services', async (req, res) => {
      const serviceLimit = +req.query.limit;
      const query = {};
      const cursor = servicesDataCollection.find(query).sort({ date: -1 });
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
      const query = { _id: ObjectId(serviceId) };
      const serviceDetails = await servicesDataCollection.findOne(query);
      res.send(serviceDetails);
    });
    app.get('/add_review/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const serviceDetails = await servicesDataCollection.findOne(query);
      res.send(serviceDetails);
    });
    app.post('/add_review', async (req, res) => {
      const review = req.body;
      const result = await reviewDataCollection.insertOne(review);
      res.send(result);
    });
    app.post('/add_service', async (req, res) => {
      const service = req.body;
      const result = await servicesDataCollection.insertOne(service);
      res.send(result);
    });
    app.get('/recent_work', async (req, res) => {
      const query = {};
      const cursor = recentWorkDataCollection.find(query);
      const recentWorkData = await cursor.toArray();
      res.send(recentWorkData);
    });
    app.get('/my_review', verifyJWT, async (req, res) => {
      const decoded = req.decoded;
      const userEmail = req.query.email;
      if (decoded.email !== userEmail) {
        res.status(401).send({ message: 'unauthorized access' });
      }
      let query = {};
      if (req.query.email) {
        query = { email: userEmail };
      }
      const cursor = reviewDataCollection.find(query).sort({ date: -1 });
      const reviews = await cursor.toArray();
      res.send(reviews);
    });
    app.get('/review_data', async (req, res) => {
      const categoryName = req.query.category;
      const query = { category: categoryName };
      const cursor = reviewDataCollection.find(query).sort({ date: -1 });
      const reviews = await cursor.toArray();
      res.send(reviews);
    });
    app.delete('/review_data/:reviewId', async (req, res) => {
      const id = req.params.reviewId;
      const query = { _id: ObjectId(id) };
      const result = await reviewDataCollection.deleteOne(query);
      res.send(result);
    });
    app.get('/review_rewrite/:reviewId', async (req, res) => {
      const reviewId = req.params.reviewId;
      const query = { _id: ObjectId(reviewId) };
      const cursor = reviewDataCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
    });
    app.patch('/review_rewrite/:id', async (req, res) => {
      const id = req.params.id;
      const newReview = req.body;
      const filter = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          img: newReview.photoUrl,
          name: newReview.name,
          review: newReview.review,
          rating: newReview.rating,
        },
      };
      const result = await reviewDataCollection.updateOne(filter, updateDoc);
      res.send(result);
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
