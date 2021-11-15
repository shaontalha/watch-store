const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.heqw3.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('watch_store');
        const usersCollection = database.collection('users');
        const productsCollection = database.collection('products');
        const ordersCollection = database.collection('orders');

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        })

        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);


        });

        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        });

        app.post("/addAproduct", async (req, res) => {
            const result = await productsCollection.insertOne(req.body);

            res.send(result);
        })

        app.get("/explore", async (req, res) => {
            const result = await productsCollection.find({}).toArray();
            res.send(result);
        })

        app.get("/singleProduct/:id", async (req, res) => {

            const result = await productsCollection.find({ _id: ObjectId(req.params.id) }).toArray();
            res.send(result[0]);
        })

        app.post("/confirmOrder", async (req, res) => {
            const result = await ordersCollection.insertOne(req.body);
            res.send(result);

        })

        app.get("/myOrders/:email", async (req, res) => {
            const result = await ordersCollection.find({ email: req.params.email }).toArray();
            res.send(result)
        })

        app.delete("/deleteOrder/:id", async (req, res) => {
            console.log(req.params.id)
            const result = await ordersCollection.deleteOne({ _id: req.params.id });
            console.log(result);
            res.json(result)
        })


    }
    finally {
        // await client.close();
    }

}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello Eatch Store!')
})

app.listen(port, () => {
    console.log(`Listening at ${port}`)
})