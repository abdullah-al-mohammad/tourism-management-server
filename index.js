const express = require('express');
const cors = require('cors');
const app = express()
const port = process.env.PORT || 5000
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


// middleWare
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3umb5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const tourismSpotCollection = client.db('spotDB').collection('addSpot')
    const tourismSpotUserCollection = client.db('spotDB').collection('user')

    app.post('/addSpot', async(req, res) =>{
      const addSpot = req.body
      console.log('add tourist spot', addSpot);
      const result = await tourismSpotCollection.insertOne(addSpot)
      res.send(result)
    })

    app.get('/addSpot', async(req, res) =>{
      const cursor = tourismSpotCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })

    app.get('/addSpot/:id', async(req, res) => {
      const id = req.params.id
      const query = {_id: new ObjectId(id)}
      const result = await tourismSpotCollection.findOne(query)
      res.send(result)
    })


    // user Information
    app.post("/user", async(req, res) =>{
      const users = req.body
      const result = await tourismSpotUserCollection.insertOne(users)
      console.log(result);
      res.send(result)
    })

    app.get('/user', async (req, res) => {
      const result = await tourismSpotUserCollection.find().toArray()
      res.send(result)
    })
    app.get('/user/:userId', async (req, res) => {
      const userId = req.params.userId
      const query ={_id: new ObjectId(userId)} 
      const result = await tourismSpotUserCollection.findOne(query)
      res.send(result)
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) =>{
    res.send('port is running')
})
app.listen(port, ()=>{
    console.log(`tourism server is running on port ${port}`);
    
})