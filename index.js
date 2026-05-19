const express = require('express')
const dotenv = require('dotenv');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
dotenv.config();

const uri = process.env.MONGO_URI;
const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});




async function run() {
  try {

    // await client.connect();


    const db = client.db("IdeaVault");
    const ideasCollection = db.collection("ideas");

    //ideas routes
    app.get('/idea', async (req, res) => {

      const result = await ideasCollection.find().toArray();

      res.json(result);
    })


    app.post('/idea', async (req, res) => {

      const ideaData = req.body;

      const result = await ideasCollection.insertOne(ideaData);

      res.json(result);
    })

    app.get('/idea/:id', async (req, res) => {

      const { id } = req.params;

      const result = await ideasCollection.findOne({ _id: new ObjectId(id) });

      res.json(result);
    })


//my ideas routes

    app.get('/my-ideas/:id', async (req, res) => {

      const { id } = req.params;

      const result = await ideasCollection.find({ _id: new ObjectId(id) }).toArray();

      res.json(result);

    })





    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Server is running......')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})