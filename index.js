const express = require('express')
const dotenv = require('dotenv');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { createRemoteJWKSet, jwtVerify } = require('jose-cjs');
dotenv.config();

const uri = process.env.MONGODB_URI;
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


const JWKS = createRemoteJWKSet(
    new URL(`${process.env.CLIENT_URL}/api/auth/jwks`)
)


const verifyToken = async (req, res, next) => {
    const authHeader = req?.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "Unauthorized" })
    }


    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }


    try {

        const { payload } = await jwtVerify(token, JWKS);
        // console.log("payload",payload)
        next()

    } catch (error) {
        return res.status(403).json({ message: "Forbidden" });
    }

}




async function run() {
  try {

    // await client.connect();


    const db = client.db("IdeaVault");
    const ideasCollection = db.collection("ideas");
    const commentsCollection = db.collection("comments");

    //ideas routes
    app.get('/idea', async (req, res) => {

      const result = await ideasCollection.find().toArray();

      res.json(result);
    })


    app.post('/idea', verifyToken, async (req, res) => {

      const ideaData = req.body;

      const result = await ideasCollection.insertOne(ideaData);

      res.json(result);
    })

    app.get('/idea/:id',verifyToken, async (req, res) => {

      const { id } = req.params;

      const result = await ideasCollection.findOne({ _id: new ObjectId(id) });

      res.json(result);
    })


    app.patch('/idea/:id',verifyToken, async (req, res) => {

      const { id } = req.params;
      const ideaData = req.body;

      const result = await ideasCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: ideaData });

      res.json(result);
    })




    app.delete('/idea/:id', async (req, res) => {

      const { id } = req.params;

      const result = await ideasCollection.deleteOne({ _id: new ObjectId(id) });

      res.json(result);
    })


    //my ideas routes

    app.get('/my-ideas/:id',verifyToken, async (req, res) => {

      const { id } = req.params;

      const result = await ideasCollection.find({ userId: id }).toArray();

      res.json(result);

    })



    //comments routes

    app.get('/comment/:id',verifyToken, async (req, res) => {

      const { id } = req.params;

      const result = await commentsCollection.find({ ideaId: id }).toArray();

      res.json(result);

    });


    app.post('/comment', verifyToken, async (req, res) => {

      const commentData = req.body;

      const result = await commentsCollection.insertOne(commentData);

      res.json(result);
    });


    app.patch('/comment/:id', verifyToken, async (req, res) => {

      const { id } = req.params;
      const commentData = req.body;

      const result = await commentsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: commentData });

      res.json(result);
    })



    app.delete('/comment/:id', async (req, res) => {

      const { id } = req.params;

      const result = await commentsCollection.deleteOne({ _id: new ObjectId(id) });

      res.json(result);
    })







    // total comments by user

    app.get('/my-comments/:id',verifyToken, async (req, res) => {

      const { id } = req.params;

      const result = await commentsCollection.find({ userId: id }).toArray();

      res.json(result);

    });
 


    // total interaction..

    app.get('/my-interactions/:id',verifyToken, async (req, res) => {

      const { id } = req.params;

      const comments = await commentsCollection.find({ userId: id }).sort({ createdAt: -1 }).toArray();

      const ideas = await ideasCollection.find({ userId: id }).toArray();

      const result = {
        totalComments: comments.length,
        totalIdeas: ideas.length,
        totalInteractions: comments.length + ideas.length,
        recentComments: comments
      };

      res.json(result);

    });






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