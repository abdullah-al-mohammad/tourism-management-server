const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const app = express()
const port = process.env.PORT || 5000
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


// middleWare
app.use(cors({
	origin: ['http://localhost:5173'],
	credentials: true
}))
app.use(express.json())
app.use(cookieParser())

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

		// jwt token
		app.post('/jwt', async(req , res) => {
			const user = req.body
			console.log(user);
			// generate token
			const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" }) 
			console.log('tok token', token);
			// send token to cookies
			
			res
				.cookie('token', token, {
					httpOnly: true,
					secure: false,
					sameSite: 'none'

				})
				.send({ success:true})
			
		})
		app.post('/addSpot', async (req, res) => {
			const addSpot = req.body
			// console.log(addSpot);
			
			const {creator} = addSpot
			addSpot.creator = new ObjectId(creator)
			console.log('add tourist spot', addSpot);
			const result = await tourismSpotCollection.insertOne(addSpot)
			res.send(result)
		})

		app.get('/addSpot', async (req, res) => {
			console.log(req.query.email);
			console.log('token', req.cookies.token);
			
			let query = {}
			if(req.query?.email){
				query={email: req.query.email}
			}
			const cursor = tourismSpotCollection.find(query)
			const result = await cursor.toArray()
			res.send(result)
		})

		app.get('/addSpot/:id', async (req, res) => {
			const id = req.params.id
			const query = { _id: new ObjectId(id) }
			const result = await tourismSpotCollection.findOne(query)
			res.send(result)
		})

		// app.get('/addSpot', async (req, res) => {
		// 	console.log(req.query);
			
		// 	const userId = req.query.creator
		// 	// console.log(userId);
			
		// 	const result = await tourismSpotCollection.find().toArray()
		// 	res.send(result)
		// })


		// user Information
		app.post("/user", async (req, res) => {
			const users = req.body
			const result = await tourismSpotUserCollection.insertOne(users)
			console.log(result);
			res.send(result)
		})

		app.get('/user', async (req, res) => {
			const email = req.query.e
			if (!email) {
				return res.status(400).send({ error: 'Email is required' });
			}
			try {
				const result = await tourismSpotUserCollection.findOne({ email })
				if (result) {
					res.send(result)
				} else {
					res.status(404).send({ error: 'User not found' })
				}

			} catch (err) {
				console.error('Error fetching user:', err);
				res.status(500).send({ error: 'Internal Server Error' });
			}
		})

		app.get('/user/:userId', async (req, res) => {
			const userId = req.params.userId
			const query = { _id: new ObjectId(userId) }
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

app.get('/', (req, res) => {
	res.send('port is running')
})
app.listen(port, () => {
	console.log(`tourism server is running on port ${port}`);

})